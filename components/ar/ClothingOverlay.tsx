"use client"

import { useEffect, useRef } from "react"
import { loadPoseLandmarker } from "@/lib/mediapipe"

interface Props {
  videoElement: HTMLVideoElement | null
  clothingImageUrl: string
  active: boolean
}

export default function ClothingOverlay({ videoElement, clothingImageUrl, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const bgRemovedRef = useRef<HTMLCanvasElement | null>(null)
  const landmarkerRef = useRef<any>(null)

  useEffect(() => {
    if (!clothingImageUrl) return
    bgRemovedRef.current = null

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = clothingImageUrl

    img.onload = () => {
      const offscreen = document.createElement("canvas")
      offscreen.width = img.naturalWidth
      offscreen.height = img.naturalHeight
      const ctx = offscreen.getContext("2d")!
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const brightness = (r + g + b) / 3
        if ((r > 210 && g > 210 && b > 210) || brightness > 230) {
          data[i + 3] = Math.max(0, 255 - brightness)
        }
      }
      ctx.putImageData(imageData, 0, 0)
      bgRemovedRef.current = offscreen
    }
  }, [clothingImageUrl])

  useEffect(() => {
    if (!active || !videoElement) return
    let running = true

    async function init() {
      try {
        landmarkerRef.current = await loadPoseLandmarker()
        renderLoop()
      } catch (e) {
        console.error("Failed to load landmarker:", e)
      }
    }

    function renderLoop() {
      if (!running || !canvasRef.current || !videoElement) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!
      const vw = videoElement.videoWidth || 640
      const vh = videoElement.videoHeight || 480
      canvas.width = vw
      canvas.height = vh
      ctx.clearRect(0, 0, vw, vh)

      if (!landmarkerRef.current || !bgRemovedRef.current || videoElement.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(renderLoop)
        return
      }

      try {
        const results = landmarkerRef.current.detectForVideo(videoElement, performance.now())
        if (results?.landmarks?.[0]) {
          const lm = results.landmarks[0]
          const ls = lm[11], rs = lm[12], lh = lm[23], rh = lm[24]
          if (ls && rs && lh && rh) {
            const lsx = (1 - ls.x) * vw, rsx = (1 - rs.x) * vw
            const lsy = ls.y * vh, rsy = rs.y * vh
            const hipY = ((lh.y + rh.y) / 2) * vh
            const shoulderCX = (lsx + rsx) / 2
            const shoulderCY = (lsy + rsy) / 2
            const shoulderW = Math.abs(lsx - rsx)
            const clothW = shoulderW * 1.7
            const torsoH = hipY - shoulderCY
            const clothH = Math.max(torsoH * 1.35, clothW * 1.2)
            const x = shoulderCX - clothW / 2
            const y = shoulderCY - clothH * 0.06

            ctx.save()
            ctx.globalAlpha = 0.88
            ctx.drawImage(bgRemovedRef.current, x, y, clothW, clothH)
            ctx.restore()
          }
        }
      } catch (e) { /* ignore frame errors */ }

      animFrameRef.current = requestAnimationFrame(renderLoop)
    }

    init()
    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [active, videoElement, clothingImageUrl])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: "scaleX(-1)" }}
    />
  )
}