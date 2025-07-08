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

const users: User[] = [];

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
    ws.on("message", function message (data){
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
            const roomId = parsedData.roomId;
            if(!roomId){
                console.warn("Failed to join room! No roomId received");
                return;
            }
            // prevent duplicate room joins
            if(!user.rooms.includes(roomId)){
                user?.rooms.push(roomId);
                console.log(`User ${user.userId} has joined the room ${roomId}`);
            }
            
        }
        if(parsedData.type === "chat"){
            // get his message, broadcast to all other user with same roomId
            // but first: verify if any room with this roomId exists in this user (i.e. the user is himself part of this room or not)
            const availability = user.rooms.includes(parsedData.roomId);
            if(!availability){
                console.warn(`User ${user.userId} Attempted to send message to ${parsedData.roomId} which he himself is not part of!`);
                return null;
            }
            // valid availability : broadcase to all other user w/ same roomId
            users.forEach(otherUsers =>{
                if( otherUsers.ws !== ws && otherUsers.rooms.includes(parsedData.roomId) ){
                    otherUsers.ws.send(JSON.stringify({
                        type: "chat",
                        roomId: parsedData.roomId,
                        userId: user.userId,
                        message: parsedData.message
                    }))
                }
            })
            console.log(`User ${user.userId} sent a new message to ${parsedData.roomId}`);
        }
        if(parsedData.type === "leave_room"){
            //get this user's room[] and remove this room from there
            const roomId = parsedData.roomId;
            if(!roomId){
                console.warn("Failed to leave room! No roomId received");
                return;
            }

            user.rooms = user.rooms.filter(r => r !== parsedData.roomId);
            console.log(`User ${user.userId} has left the room ${parsedData.roomId}`);
        }
    })
}
)
