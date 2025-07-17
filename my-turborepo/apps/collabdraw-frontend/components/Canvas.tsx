"use client";

import { drawInIt } from "@/draw";
import { useEffect, useRef } from "react";


export function Canvas({roomSlug}: {roomSlug: string} ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        
        drawInIt(canvas,roomSlug);
    }, [canvasRef]);

    return (
        <div>
          <canvas ref={canvasRef} className="block"></canvas>
          <div className="fixed bottom-0 right-0">
            <div className="bg-white text-black">
                <button > Rectangle</button>
                <button> Circle</button>
            </div>
          </div>
        </div>
      );
}