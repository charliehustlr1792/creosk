"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  aiReason: string
}

function CompleteContent() {
  const router = useRouter()
  const params = useSearchParams()
  const productId = params.get("productId") || ""
  const occasion = params.get("occasion") || ""
  const vibe = params.get("vibe") || ""
  const skinTone = params.get("skinTone") || ""

  const [mainProduct, setMainProduct] = useState<Product | null>(null)
  const [suggestions, setSuggestions] = useState<Product[]>([])

  useEffect(() => {
    const query = new URLSearchParams({ occasion, vibe, skinTone })
    fetch(`/api/products?${query}`)
      .then(r => r.json())
      .then((data: Product[]) => {
        const main = data.find(p => p.id === productId) || data[0]
        setMainProduct(main)
        // Suggest other items as "complete the look"
        setSuggestions(data.filter(p => p.id !== productId).slice(0, 2))
      })
  }, [])

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-lg flex flex-col gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <p className="text-xs tracking-widest text-zinc-500 uppercase mb-2">
            Great choice
          </p>
          <h1 className="text-3xl font-light">Complete the Look</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Items that pair perfectly with your selection
          </p>
        </div>

        {/* Main item */}
        {mainProduct && (
          <div className="flex items-center gap-4 p-4 border border-zinc-700">
            <div className="relative w-16 h-20 bg-zinc-800">
              <Image src={mainProduct.imageUrl} alt={mainProduct.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{mainProduct.name}</p>
              <p className="text-zinc-400 text-sm">₹{mainProduct.price}</p>
            </div>
            <span className="text-xs bg-zinc-800 px-2 py-1 text-zinc-400">In Bag</span>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-3">
            {suggestions.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center gap-4 p-4 border border-zinc-800 hover:border-zinc-600 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="relative w-16 h-20 bg-zinc-800">
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-zinc-400 text-sm">₹{p.price}</p>
                  {p.aiReason && (
                    <p className="text-xs text-zinc-500 mt-1 italic">{p.aiReason}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    const query = new URLSearchParams({ productId: p.id, occasion, vibe, skinTone })
                    router.push(`/tryon?${query}`)
                  }}
                  className="text-xs border border-zinc-700 px-3 py-2 hover:border-white transition-colors"
                >
                  Try On
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Final CTAs */}
        <div className="flex flex-col gap-3">
          <button className="w-full py-4 bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
            Checkout (Mock) →
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-600 hover:text-zinc-400 text-center underline"
          >
            Start over
          </button>
        </div>
      </motion.div>
    </main>
  )
}

export default function CompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  )
}