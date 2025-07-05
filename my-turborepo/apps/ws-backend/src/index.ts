import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/config";
import { prismaClient } from "@repo/db/config";

const wss = new WebSocketServer({port : 8081});

wss.on("connection", function connection(ws){
    ws.on("error", console.error);

    ws.on("message", function message(data){
        ws.send('PONG');
    })
})
