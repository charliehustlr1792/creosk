"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import CameraFeed, { CameraFeedHandle } from "@/components/ar/CameraFeed"
import ClothingOverlay from "@/components/ar/ClothingOverlay"
import PositionGuide from "@/components/ar/PositionGuide"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  imageUrl: string
  aiReason: string
}

function TryOnContent() {
  const router = useRouter()
  const params = useSearchParams()
  const productId = params.get("productId") || ""
  const occasion = params.get("occasion") || ""
  const vibe = params.get("vibe") || ""
  const skinTone = params.get("skinTone") || ""

  const cameraRef = useRef<CameraFeedHandle>(null)
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [arActive, setArActive] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [hdResult, setHdResult] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [leadSent, setLeadSent] = useState(false)
  const [contact, setContact] = useState("")
  const [showLeadForm, setShowLeadForm] = useState(false)

  // Load product
  useEffect(() => {
    const query = new URLSearchParams({ occasion, vibe, skinTone })
    fetch(`/api/products?${query}`)
      .then(r => r.json())
      .then((data: Product[]) => {
        setAllProducts(data)
        const selected = data.find(p => p.id === productId) || data[0]
        setProduct(selected)
      })
  }, [productId])

  // Hide guide after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowGuide(false), 4000)
    return () => clearTimeout(t)
  }, [])

  async function generateHD() {
    if (!cameraRef.current || !product) return
    setGenerating(true)
    setHdResult(null)

    try {
      const frameBlob = cameraRef.current.captureFrame()
      if (!frameBlob) throw new Error("Could not capture frame")

      const formData = new FormData()
      formData.append("personImage", frameBlob, "person.jpg")
      formData.append("clothingId", product.id)

      const res = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.resultUrl) setHdResult(data.resultUrl)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  async function submitLead() {
    if (!contact) return
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, productId: product?.id }),
    })
    setLeadSent(true)
    setShowLeadForm(false)
  }

  function goToComplete() {
    const query = new URLSearchParams({ productId: product?.id || "", occasion, vibe, skinTone })
    router.push(`/complete?${query}`)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row">

      {/* LEFT — Camera + AR */}
      <div className="relative flex-1 min-h-[60vh] lg:min-h-screen bg-zinc-950">
        <CameraFeed
          ref={cameraRef}
          onStreamReady={(video) => {
            setVideoEl(video)
            setArActive(true)
          }}
        />

        <ClothingOverlay
          videoElement={videoEl}
          clothingImageUrl={product.imageUrl}
          active={arActive}
        />

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <PositionGuide />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top left label */}
        <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
          LIVE PREVIEW
        </div>

        {/* Generate HD button */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button
            onClick={generateHD}
            disabled={generating}
            className="px-8 py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {generating ? "Generating HD Look..." : "✨ Generate HD Try-On"}
          </button>
        </div>
      </div>

      {/* RIGHT — Controls */}
      <div className="w-full lg:w-96 flex flex-col bg-zinc-950 border-l border-zinc-800">

        {/* Current product */}
        <div className="p-6 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Currently Trying
          </p>
          <div className="flex gap-4">
            <div className="relative w-16 h-20 bg-zinc-800 shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-zinc-400 text-sm mt-1">₹{product.price}</p>
              {product.aiReason && (
                <p className="text-xs text-zinc-500 mt-2 italic">{product.aiReason}</p>
              )}
            </div>
          </div>
        </div>

        {/* HD Result */}
        <AnimatePresence>
          {(generating || hdResult) && (
            <motion.div
              className="p-6 border-b border-zinc-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                HD Result
              </p>
              {generating ? (
                <div className="h-48 bg-zinc-900 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500">AI is generating your look...</p>
                </div>
              ) : hdResult ? (
                <div className="relative w-full h-64 bg-zinc-900">
                  <img
                    src={hdResult}
                    alt="HD Try-On Result"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch items */}
        <div className="p-6 border-b border-zinc-800 flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Try Other Picks
          </p>
          <div className="flex flex-col gap-2">
            {allProducts
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProduct(p)
                    setHdResult(null)
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="relative w-10 h-12 bg-zinc-800 shrink-0">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-300">{p.name}</p>
                    <p className="text-xs text-zinc-500">₹{p.price}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={goToComplete}
            className="w-full py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Add to Bag →
          </button>

          {!leadSent ? (
            <>
              {showLeadForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Email or phone"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    onClick={submitLead}
                    className="px-4 py-2 bg-zinc-700 text-white text-sm hover:bg-zinc-600"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="w-full py-3 border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition-colors"
                >
                  📱 Send to my phone
                </button>
              )}
            </>
          ) : (
            <p className="text-center text-xs text-zinc-500">✅ Link sent!</p>
          )}

          <button
            onClick={() => router.push(`/lookbook?${new URLSearchParams({ skinTone, occasion, vibe })}`)}
            className="text-xs text-zinc-600 hover:text-zinc-400 text-center underline"
          >
            ← Back to lookbook
          </button>
        </div>
      </div>
    </main>
  )
}

export default function TryOnPage() {
  return (
    <Suspense>
      <TryOnContent />
    </Suspense>
  )
}