import { useCallback } from "react";
import { mount } from "./3d";

export default function ForgeCanvas() {
    const containerRef = useCallback(mount, []);
    return (
        <div ref={containerRef}>
        </div>
    )
}