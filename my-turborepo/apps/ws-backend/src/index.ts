import { WebSocketServer,WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, {JwtPayload} from "jsonwebtoken";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/config";
import { prismaClient } from "@repo/db/config";


const wss = new WebSocketServer({port : 8081});
console.log("wss running on port : 8081");

interface User {
    userId: string,
    rooms: string[],
    ws: WebSocket
}

interface ChatQueueItems {
    message: string,
    roomId: number,
    userId: string
}

const users: User[] = [];
const chatQueue: ChatQueueItems[] = [];

function verifyToken(token: string): string | null{
    // verify token using JWT
    try{
        const decoded = jwt.verify(token,JWT_SECRET) as {userId: string};
        if(!decoded || !decoded.userId){
            console.warn("Connection Rejected! Token received but without valid userId attached");
            return null;
        }
        // if token valid: return userId
        return decoded.userId;
    }catch(e){
        console.warn("error at WSS during verifyToken, error: "+e);
        return null;
    }
}

// asynchronous function to put chatQueue to DB in background
async function processChatQueue(){
    // get the chat from chatQueue
    while(true){
        if(chatQueue.length > 0){
            const chat = chatQueue.shift(); // returns the first el. of the array
            // put this chat into db
            try {
                await prismaClient.chat.create({
                    data: {
                        message: chat?.message as unknown as string,
                        roomId: chat?.roomId as unknown as number,
                        userId: chat?.userId as unknown as string
                    }
                })
            } catch (error) {
                console.warn(`Chat into DB Failed! Last Chat Message Tried: ${chat?.message} by userId: ${chat?.userId}`);
            }
        }
        else{ // if chatQueue is empty, pause to avoid busy-waiting
            await new Promise(res => setTimeout(res,1000));
        }
    }
}

// start the processChatQueue once when the server starts
processChatQueue();

wss.on("connection", function connection (ws,request){
    // user connect hua hain, exectue below steps:
    // 1. get queryParams from url
    // 2. get token from queryParams and verify token
    // 3. token verified: extract userId
    // 4. for each user, we'd have this architecture: user : { userId, rooms[], ws}
    
    const url = request.url;
    if(!url){
        console.warn("Connection Rejected! No url found");
        ws.close(1008,"missing url");
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token") || "";
    if(!token){
        console.warn("Connection Rejected! No token attached with URL");
        ws.close(1008,"missing token attachment");
        return;
    }
    const token_Identity = verifyToken(token);
    if(token_Identity === null){
        ws.close(1008,"error in token verification");
        return;
    }

    users.push({
        userId: token_Identity as unknown as string,
        rooms:[],
        ws
    })
    
    // now handle different operations for this user ..
    ws.on("message",async function message (data){
        // the structure of data would be : {type, roomId, message (if type === 'chat') };
        let parsedData;
        if(typeof data !== "string"){
            parsedData = JSON.parse(data.toString());
        }else{
            parsedData = JSON.parse(data);
        }

        const user = users.find(x => x.ws === ws);
        if(!user){
            console.warn("Connection Rejected! user not found in system");
            return;
        }

        if(parsedData.type === "join_room"){
            // get the room_Id, put this room_id in his users' room 
            const roomSlug = parsedData.roomSlug;
            if(!roomSlug){
                console.warn(`missing field in payload: roomId required`);
                return;
            }
            const room = await prismaClient.room.findUnique({
                where: {slug: roomSlug}
            })
            // Scenerio 1: roomSlug is new to room DB 
            if(!room){
                // add room to DB
                try {
                    await prismaClient.room.create({
                        data:{
                            slug: roomSlug,
                            adminId: user.userId
                        }
                    })
                    console.log(`roomSlug ${roomSlug} successfully stored in the Database`);
                } catch (error) {
                    console.warn(`Failed in storing the valid roomSlug to the DB, error: ${error}`);
                    return;
                }
            }
            // Scenerio 2: roomSlug already exists in the room DB
            if(!user.rooms.includes(roomSlug)){
                user.rooms.push(roomSlug);
                console.log(`User ${user.userId} has joined the room ${roomSlug}`);
            }
            
        }
        if(parsedData.type === "chat"){
            const { message } = parsedData;
            const roomSlug = parsedData.roomSlug;
            if(!roomSlug || !message){
                console.warn( !roomSlug ? `missing field in Payload: required roomId` : `missing field in Payload: required message`);
                return;
            }

            // verify if this room exists in the db
            const room = await prismaClient.room.findUnique({
                where: {slug: roomSlug}
            });
            if(!room){
                console.warn(`Failed to chat as no database found no existing room with roomSlug: ${roomSlug}`);
                return;
            }

            // user should be himself in same room to be able to broadcast a message
            const isInRoom = user.rooms.includes(roomSlug);
            if (!isInRoom) {
                console.warn(`User ${user.userId} tried to message room ${roomSlug} without being in it.`);
                return;
            }
        
            // now ,send the message in the room's db and also to other user's in the same room
            try {
                chatQueue.push({
                    message,
                    roomId: room.id,
                    userId: user.userId
                });
            } catch (err) {
                console.error("Failed to persist chat to DB:", err);
                return;
            }
        
            // STEP 2: Broadcast to other users in the room
            users.forEach(otherUser => {
                if (otherUser.rooms.includes(roomSlug)) {
                    otherUser.ws.send(JSON.stringify({
                        type: "chat",
                        roomSlug,
                        userId: user.userId,
                        message
                    }));
                }
            });
        
            console.log(`User ${user.userId} sent and saved message to room ${roomSlug}`);
        }
        
        if(parsedData.type === "leave_room"){
            const roomSlug = parsedData.roomSlug;
            if(!roomSlug){
                console.warn(`missing field in Payload: roomId required!`);
                return;
            }
            // check if this room exists
            const room = await prismaClient.room.findFirst({ where: {slug: roomSlug}});
            if(!room){
                console.warn(`Request Aborted, No room with name ${roomSlug} exists in the DB`);
                return;
            }
            // check if this user is part of the room
            const member = user.rooms.includes(roomSlug);
            if(!member){
                console.warn(`User ${user.userId} tried to leave room "${roomSlug}" they aren't part of.`);
                return;
            }
            // check if it's the admin who wants to leave/end the room
            const isAdmin = room.adminId === user.userId;
            if(isAdmin){
                // clear the chat from database, clear the room from database, remove the room from all user' []
                
                const chatDelete =  await prismaClient.chat.deleteMany({
                    where: {roomId: room.id}
                })

                if(chatDelete){
                    console.log(`deleted all chats from database of this room`);
                    await prismaClient.room.delete({
                        where: {id: room.id}
                    })
                }

                users.forEach(u =>{
                    u.rooms = u.rooms.filter(r => r!== roomSlug);
                })
            }else{
                // Just remove from this user's room
                user.rooms = user.rooms.filter(r => r !== roomSlug);
                console.log(`User ${user.userId} left room "${roomSlug}"`);
            }
            
        }
    })

    ws.on("close", () => {
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            const disconnectedUser = users[index];
            console.log(`User ${disconnectedUser?.userId} disconnected`);
            users.splice(index, 1);
        } else {
            console.log("Disconnected socket not found in user list.");
        }
    });
});


