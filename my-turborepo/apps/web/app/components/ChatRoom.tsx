import axios from "axios";
import { BACKEND_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomSlug: string) {
    console.warn(`sending requiest for roomSlug: ${roomSlug}`);
    const response = await axios.get(`${BACKEND_URL}/api/chat/${roomSlug}`);
    if (!response.data.success) {
        console.log(`please re-check roomName, current roomName doesn't exist`);
        alert(`please re-check roomName, current roomName doesn't exist`);
        return [];
    } else {
        console.log(response.data.data.messages);
        return response.data.data.messages;
    }
}



export async function ChatRoom({roomSlug}: {roomSlug: string}){
    console.warn(`roomSlug before getChats: ${roomSlug}`);
    const messages = await getChats(roomSlug);
    return <ChatRoomClient roomSlug={roomSlug} messages={messages}></ChatRoomClient>
}