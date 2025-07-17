import { Canvas } from "@/components/Canvas";

export default async function CanvasPage({ params }: { params: { roomSlug: string } }) {
    const roomSlug = params.roomSlug;
    console.log(roomSlug);
    return <Canvas roomSlug={roomSlug} />;
}
