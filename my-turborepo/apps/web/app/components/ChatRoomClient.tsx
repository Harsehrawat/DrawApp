'use client';

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    roomSlug
}: {
    messages: { message: string; user: { name: string } }[];
    roomSlug: string
}) {
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (socket && !loading) {

            socket.send(JSON.stringify({
                type: "join_room",
                roomSlug: roomSlug
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, { message: parsedData.message, user: { name: "User" } }]);
                }
            }
        }
    }, [socket, loading,chats]);

    return <div>
        {chats.map((m, idx) => <div key={idx}><strong>{m.user?.name ?? "Anonymous"}:</strong> {m.message}</div>)}

        <input type="text" value={currentMessage} onChange={e => {
            setCurrentMessage(e.target.value);
        }}></input>
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "chat",
                roomSlug: roomSlug,
                message: currentMessage
            }));

            setCurrentMessage("");
        }}>Send message</button>
    </div>
}
