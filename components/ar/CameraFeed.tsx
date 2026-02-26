"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"

export interface CameraFeedHandle {
    captureFrame: () => Blob | null
}

interface Props {
    onStreamReady?: (video: HTMLVideoElement) => void
}

const CameraFeed = forwardRef<CameraFeedHandle, Props>(({ onStreamReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useImperativeHandle(ref, () => ({
        captureFrame: (): Blob | null => {
            if (!videoRef.current) return null
            const canvas = document.createElement("canvas")
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            const ctx = canvas.getContext("2d")
            if (!ctx) return null
            // mirror the capture to match the mirrored video display
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(videoRef.current, 0, 0)
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
            const byteString = atob(dataUrl.split(",")[1])
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
            return new Blob([ab], { type: "image/jpeg" })
        },
    }))

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.onloadeddata = () => {
                        setLoading(false)
                        if (onStreamReady && videoRef.current) {
                            onStreamReady(videoRef.current)
                        }
                    }
                }
            } catch (e) {
                setError("Camera access denied. Please allow camera permissions.")
                setLoading(false)
            }
        }
        startCamera()

        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
                tracks.forEach(t => t.stop())
            }
        }
    }, [])

    return (
        <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <p className="text-zinc-500 text-sm">Starting camera...</p>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect
            />
        </div>
    )
})

CameraFeed.displayName = "CameraFeed"
export default CameraFeed