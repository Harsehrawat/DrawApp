"useClient";

import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);


    useEffect( ()=>{
        // connect to ws server
        const ws = new WebSocket(WEBSOCKET_URL);
        ws.onopen =()=>{
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }
}
