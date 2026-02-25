"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  imageUrl: string
  aiReason: string
}

function LookbookContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const skinTone = params.get("skinTone") || ""
  const occasion = params.get("occasion") || ""
  const vibe = params.get("vibe") || ""

  useEffect(() => {
    const query = new URLSearchParams({ skinTone, occasion, vibe })
    fetch(`/api/products?${query}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [skinTone, occasion, vibe])

  function goToTryOn(productId: string) {
    const query = new URLSearchParams({ productId, skinTone, occasion, vibe })
    router.push(`/tryon?${query}`)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-8 py-10 border-b border-zinc-800">
        <p className="text-xs tracking-widest text-zinc-500 uppercase mb-2">
          Curated for you
        </p>
        <h1 className="text-3xl font-light">Your Lookbook</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          {occasion} · {vibe} · matched to your skin tone
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-zinc-500">Finding your perfect matches...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-zinc-500">No matches found for this combination.</p>
          <button
            onClick={() => router.push("/profile")}
            className="text-sm underline text-zinc-400"
          >
            Try different preferences
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className="border border-zinc-800 bg-zinc-900 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative aspect-square bg-zinc-800">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">
                    {product.brand}
                  </p>
                  <h3 className="font-medium mt-1">{product.name}</h3>
                  <p className="text-zinc-300 mt-1">₹{product.price}</p>
                </div>

                {product.aiReason && (
                  <p className="text-xs text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                    {product.aiReason}
                  </p>
                )}

                <button
                  onClick={() => goToTryOn(product.id)}
                  className="mt-auto w-full py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  Try It On →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="px-8 pb-8">
        <button
          onClick={() => router.push("/profile")}
          className="text-sm text-zinc-600 hover:text-zinc-400 underline"
        >
          ← Change preferences
        </button>
      </div>
    </main>
  )
}

export default function LookbookPage() {
  return (
    <Suspense>
      <LookbookContent />
    </Suspense>
  )
}