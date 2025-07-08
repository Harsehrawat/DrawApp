import express from "express";

import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema,SignInSchema,  CreateRoomSchema } from "@repo/common/config";
import { prismaClient } from "@repo/db/config";
import { ZodIssue} from "zod";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware, AuthenticatedRequest } from "./middleware.js";
import { Request,Response,NextFunction } from "express";
import { success } from "zod/v4";

const app = express();
app.use(express.json());

app.post("/api/signup", async (req, res) => {
    // First: validate using Zod

    const verifyZod = CreateUserSchema.safeParse(req.body);

    if (!verifyZod.success) {
        const error = verifyZod.error.errors.map((err: ZodIssue) => ({
            field: err.path[0],
            message: err.message
        }));

        res.status(400).json({
            success: false,
            message: error
        });
        return;
    }

    // Use validated data
    try {
        const { username, password, name } = verifyZod.data;
        // Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email: username }
        });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "This username/email is already taken"
            });
            return;
        }

        // Hash the password
        const hashedPass = await bcrypt.hash(password, 5);

        // Create user
        const user = await prismaClient.user.create({
            data: {
                email: username,
                password: hashedPass,
                name: name
            }
        });

        res.status(200).json({
            success: true,
            message: "User signup successful",
            userId: user.id
        });
        return;
    } catch (e) {
        console.error("Error in /api/signup:", e);
        res.status(500).json({
            success: false,
            message: "Database Server Error"
        });
        return;
    }
});

app.post("/api/signin", async (req,res)=>{
    // first verify format of i/p username and password
    const parsedInputs = SignInSchema.safeParse(req.body);
    if(!parsedInputs.success){
        // get the errors
        const errors = parsedInputs.error.errors.map( (err: ZodIssue) => ({
            field: err.path[0],
            message: err.message
        }));
        res.status(400).json({
            success: false,
            message: errors
        })
        return;
    }
    // verify the username , then password from existing db entries
    try{
        const {username,password} = req.body;
        const user = await prismaClient.user.findFirst({
            where: {email: username}
        })
        if(!user){
            res.status(400).json({ success: false, message: "wrong username"});
            return;
        }
        
        // now verify password
        const verify_DB_Password = await bcrypt.compare( password,user.password);
        if(!verify_DB_Password){
            res.status(400).json({ success: false, message: "wrong password"});
            return;
        }

        // valid user, generate and return a jwt token
        const token = jwt.sign( {userId : user.id, userEmail: user.email}, JWT_SECRET, {expiresIn: "6h"});
        // return this to user
        res.status(200).json({ success: true, message: "user signin successfull", token});
        return;
    }catch(e){
        console.log("error at /api/signin, error : "+e);
        res.status(500).json({ success: false, message: "Server Error"});
    }
})


app.post("/api/createroom",middleware, async (req: AuthenticatedRequest,res: Response)=>{
    // now as i am using AuthenticatedRequest interface which contains the field userId, i can directly use req.userId
    const parsedInputs = CreateRoomSchema.safeParse(req.body);
    if(!parsedInputs.success){
        // get errors
        const errors = parsedInputs.error.errors.map( (err) => ({
            field: err.path[0],
            message: err.message
        }))
        res.status(403).json({ success: false, message: errors});
        return;
    }
    // successful zod validation : move to room creation using req.userId received from middleware
    try{
        if(!req.userId){
            res.json({success: false, message: "Unauthorized"});
            return;
        }
        const slug_Duplicacy = await prismaClient.room.findFirst({
            where: {slug: parsedInputs.data.name}
        })
        if(slug_Duplicacy){
            res.status(400).json({ success: false, message: "Room with this name is already active !"});
            return;
        }
        const room = await prismaClient.room.create({
            data: {
                slug: parsedInputs.data?.name,
                adminId: req.userId! // non-null promised
            }
        })
        res.json({ success: true, message: "Room Created !", roomId: room.id , roomSlug: room.slug});
        return;
    }catch(e){
        console.log("error at /api/createRoom, error : "+e);
        res.status(500).json({success: false, message: "Server Down"});
        return;
    }
});

app.get("/api/chat/:roomId", async (req,res)=>{
    const roomId = Number (req.params.roomId);
    if(!roomId){
        console.warn(`error at /api/chat/:roomId, error: No RoomId received!`);
        res.status(404).json({ success: false, message: `This Room Doesn't Exist`});
        return;
    }
    try{
        const messages = await prismaClient.chat.findMany({
            where: { roomId: roomId },
            take: 50,
            orderBy: {
                id: "desc"
            }
        });
        res.status(200).json({success: true, messages});
        return;
    }catch(e){
        console.warn(`error at /api/chat/:roomId, error: ${e}`);
    }
});

app.get("/api/chat/:roomSlug", async (req,res)=>{
    const roomSlug = req.params.roomSlug;
    if(!roomSlug){
        console.warn(`error at /api/chat/:roomSlug, error: No roomSlug received!`);
        res.status(400).json({ success: false, message: 'Invalid Input, Missing roomSlug'});
        return;
    }
    const room = await prismaClient.room.findUnique({ where: {slug: roomSlug}});
    if(!room){
        console.warn(`'error at /api/chat/:roomSlug, error: No such room found with roomSlug: ${roomSlug}`);
        res.status(400).json({ success: false, message: `Invalid Input, This Room Doesn't Exist`});
        return;
    }
    try{
        const messages = await prismaClient.chat.findMany({
            where: { roomId: room.id },
            take: 50,
            orderBy: {
                id: "desc"
            }
        });
        res.status(200).json({success: true, messages});
        return;
    }catch(e){
        console.warn(`error at /api/chat/:roomId, error: ${e}`);
        res.status(500).json({ success: false, message: "Server Error!"});
        return;
    }
});




app.listen(3001, ()=>{
    console.log("server successfully started at port : 3001");
});