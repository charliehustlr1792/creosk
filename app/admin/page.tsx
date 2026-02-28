"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  imageUrl: string
  category: string
  occasions: string[]
  vibes: string[]
  skinTones: string[]
  aiReason: string
  inStock: boolean
  createdAt: string
}

const OCCASIONS = ["casual", "office", "party", "wedding"]
const VIBES = ["minimal", "bold", "classic", "trendy"]
const SKIN_TONES = ["fair", "warm", "neutral", "cool", "deep"]

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    category: "shirt",
    occasions: [] as string[],
    vibes: [] as string[],
    skinTones: [] as string[],
    aiReason: "",
    imageFile: null as File | null,
    imagePreview: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  function toggleArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({
      ...f,
      imageFile: file,
      imagePreview: URL.createObjectURL(file)
    }))
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.imageFile) return
    if (form.occasions.length === 0 || form.vibes.length === 0 || form.skinTones.length === 0) return

    setUploading(true)

    try {
      // Upload image first
      const imageForm = new FormData()
      imageForm.append("file", form.imageFile)
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: imageForm,
      })
      const { url } = await uploadRes.json()

      // Create product
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand || "StyleAI Studio",
          price: parseFloat(form.price),
          category: form.category,
          occasions: form.occasions,
          vibes: form.vibes,
          skinTones: form.skinTones,
          aiReason: form.aiReason,
          imageUrl: url,
          inStock: true,
        }),
      })

      // Reset form
      setForm({
        name: "", brand: "", price: "", category: "shirt",
        occasions: [], vibes: [], skinTones: [], aiReason: "",
        imageFile: null, imagePreview: "",
      })
      setShowForm(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchProducts()
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    fetchProducts()
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            CRE<span className="font-bold">OSK</span>
            <span className="text-zinc-500 ml-3 text-sm font-normal tracking-widest uppercase">
              Admin
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 text-sm z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ✅ Product added successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload guidelines */}
      <div className="mx-8 mt-6 p-4 border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 flex gap-6">
        <span>📋 <strong className="text-zinc-300">Upload requirements:</strong></span>
        <span>✓ White or light background</span>
        <span>✓ Flat lay or ghost mannequin</span>
        <span>✓ No model wearing the item</span>
        <span>✓ Clear, well-lit photo</span>
      </div>

      {/* Product grid */}
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-zinc-500">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-zinc-500">No products yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm underline text-zinc-400"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                className="border border-zinc-800 bg-zinc-900 flex flex-col"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="relative aspect-square bg-zinc-800">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs text-zinc-400">Out of stock</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-zinc-500">₹{p.price}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.occasions.map(o => (
                      <span key={o} className="text-xs bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                        {o}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="mt-auto text-xs text-red-500 hover:text-red-400 text-left transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Modal header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900">
                <h2 className="font-medium">Add New Product</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-zinc-500 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Image upload */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                    Product Image *
                  </label>
                  <div
                    className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer relative"
                    onClick={() => document.getElementById("imageInput")?.click()}
                  >
                    {form.imagePreview ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={form.imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center gap-2">
                        <p className="text-zinc-500 text-sm">Click to upload image</p>
                        <p className="text-zinc-600 text-xs">White background recommended</p>
                      </div>
                    )}
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Name + Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="White Linen Shirt"
                      className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      placeholder="StyleAI Studio"
                      className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="999"
                      className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                    >
                      <option value="shirt">Shirt</option>
                      <option value="top">Top</option>
                      <option value="blouse">Blouse</option>
                    </select>
                  </div>
                </div>

                {/* Occasions */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                    Occasions * <span className="text-zinc-600 normal-case">(select all that apply)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {OCCASIONS.map(o => (
                      <button
                        key={o}
                        onClick={() => setForm(f => ({ ...f, occasions: toggleArray(f.occasions, o) }))}
                        className={`px-4 py-2 text-sm border transition-colors capitalize ${
                          form.occasions.includes(o)
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vibes */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                    Vibes * <span className="text-zinc-600 normal-case">(select all that apply)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {VIBES.map(v => (
                      <button
                        key={v}
                        onClick={() => setForm(f => ({ ...f, vibes: toggleArray(f.vibes, v) }))}
                        className={`px-4 py-2 text-sm border transition-colors capitalize ${
                          form.vibes.includes(v)
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin tones */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                    Works for skin tones * <span className="text-zinc-600 normal-case">(select all that apply)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {SKIN_TONES.map(s => (
                      <button
                        key={s}
                        onClick={() => setForm(f => ({ ...f, skinTones: toggleArray(f.skinTones, s) }))}
                        className={`px-4 py-2 text-sm border transition-colors capitalize ${
                          form.skinTones.includes(s)
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Reason */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">
                    AI Recommendation Reason
                  </label>
                  <input
                    type="text"
                    value={form.aiReason}
                    onChange={e => setForm(f => ({ ...f, aiReason: e.target.value }))}
                    placeholder="e.g. Clean lines complement warm skin tones in natural light"
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || !form.name || !form.price || !form.imageFile}
                    className="flex-1 py-3 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Add Product"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}