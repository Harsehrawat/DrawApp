import express from "express";

import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema,SignInSchema,  CreateRoomSchema } from "@repo/common/config";
import { prismaClient } from "@repo/db/config";
import { ZodIssue} from "zod";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

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
            message: "User signup successful"
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




app.listen(3001, ()=>{
    console.log("server successfully started at port : 3001");
});