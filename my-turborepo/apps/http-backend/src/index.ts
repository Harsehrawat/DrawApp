import express from "express";

import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/config";
import { prismaClient } from "@repo/db/config";

const app = express();


app.listen(3001);