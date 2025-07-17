import axios from "axios";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
  } | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
  };
  
export async function drawInIt(canvas: HTMLCanvasElement | null , roomSlug: string) {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    let existingShapes: Shape[] = await getExistingShapes(roomSlug);
  
    clearCanvas(existingShapes,canvas,ctx);
  
    let startX = 0;
    let startY = 0;
    let clicked = false;
  
    const handleMouseDown = (e: MouseEvent) => {
      clicked = true;
      const rect = canvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
    };
  
    const handleMouseUp = (e: MouseEvent) => {
      if (!clicked) return;
      clicked = false;
  
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
  
      const width = endX - startX;
      const height = endY - startY;
  
      // Add the shape to existingShapes
      existingShapes.push({
        type: "rect",
        x: startX,
        y: startY,
        width,
        height
      });
  
      // Redraw all shapes after saving
      clearCanvas(existingShapes, canvas, ctx);
    };
  
    const handleMouseMove = (e: MouseEvent) => {
      if (!clicked) return;
  
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
  
      const width = currentX - startX;
      const height = currentY - startY;
  
      // Redraw canvas with existing shapes and preview shape
      clearCanvas(existingShapes, canvas, ctx);
  
      // Draw preview rectangle
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, width, height);
    };
  
    // Event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
  
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
}
  
function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    // Clear canvas and redraw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Redraw all saved shapes
    existingShapes.forEach(shape => {
      if (shape.type === "rect") {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
}

async function getExistingShapes(roomSlug: string){
    const resp = await axios.get(`${HTTP_BACKEND}/api/chat/${roomSlug}`);
    const messages = resp.data.messages;

    const shapes = messages.map( (x: {message: string}) =>{
        const messageData = JSON.parse(x.message);
        return messageData;
    } );

    return shapes;

}
  