"use client"

import { useEffect, useRef } from "react"
import { loadPoseLandmarker, getShoulderPoints } from "@/lib/mediapipe"

interface Props {
    videoElement: HTMLVideoElement | null
    clothingImageUrl: string
    active: boolean
}

export default function ClothingOverlay({ videoElement, clothingImageUrl, active }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animFrameRef = useRef<number>(0)
    const clothImageRef = useRef<HTMLImageElement | null>(null)

    // Preload clothing image
    useEffect(() => {
        if (!clothingImageUrl) return
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = clothingImageUrl
        img.onload = () => { clothImageRef.current = img }
    }, [clothingImageUrl])

    useEffect(() => {
        if (!active || !videoElement) return

        let landmarker: any = null

        async function init() {
            landmarker = await loadPoseLandmarker()
            renderLoop()
        }

        function renderLoop() {
            if (!canvasRef.current || !videoElement || !landmarker) return

            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            canvas.width = videoElement.videoWidth || 640
            canvas.height = videoElement.videoHeight || 480

            // Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Run pose detection
            const results = landmarker.detectForVideo(videoElement, performance.now())

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0]
                const { leftShoulder, rightShoulder, leftHip, rightHip } = getShoulderPoints(landmarks)

                if (leftShoulder && rightShoulder && clothImageRef.current) {
                    // Convert normalized coords to pixel coords
                    const lx = (1 - leftShoulder.x) * canvas.width   // mirrored
                    const rx = (1 - rightShoulder.x) * canvas.width
                    const sy = leftShoulder.y * canvas.height

                    // Hip Y for height calculation
                    const hipY = ((leftHip?.y || 0) + (rightHip?.y || 0)) / 2 * canvas.height

                    // Calculate clothing dimensions
                    const shoulderWidth = Math.abs(lx - rx)
                    const clothWidth = shoulderWidth * 1.3  // slight padding
                    const clothHeight = (hipY - sy) * 1.2

                    const startX = Math.min(lx, rx) - (clothWidth - shoulderWidth) / 2
                    const startY = sy * 0.95  // sit just at shoulder line

                    // Draw clothing overlay with transparency
                    ctx.globalAlpha = 0.85
                    ctx.drawImage(
                        clothImageRef.current,
                        startX,
                        startY,
                        clothWidth,
                        clothHeight
                    )
                    ctx.globalAlpha = 1.0
                }
            }

            animFrameRef.current = requestAnimationFrame(renderLoop)
        }

        init()

        return () => {
            cancelAnimationFrame(animFrameRef.current)
        }
    }, [active, videoElement, clothingImageUrl])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
        />
    )
}