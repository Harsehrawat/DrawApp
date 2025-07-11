import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../components/ChatRoom";


export default async function ChatRoomPage({
    params
}: {
    params: {
        slug: string
    }
}) {
    const roomSlug = params.slug;

    console.warn(`RoomSlug from params in ChatRoomPage: ${roomSlug}`);
    return <ChatRoom roomSlug={roomSlug}></ChatRoom>
}