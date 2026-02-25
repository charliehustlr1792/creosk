"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const STEPS = [
  {
    key: "skinTone",
    title: "What's your skin tone?",
    subtitle: "We'll match colors that complement you",
    options: [
      { label: "Fair", value: "fair", color: "#F5D5B8" },
      { label: "Warm", value: "warm", color: "#D4A574" },
      { label: "Neutral", value: "neutral", color: "#C68642" },
      { label: "Cool", value: "cool", color: "#8D5524" },
      { label: "Deep", value: "deep", color: "#4A2912" },
    ],
    type: "swatch",
  },
  {
    key: "occasion",
    title: "What's the occasion?",
    subtitle: "We'll pick styles that fit the moment",
    options: [
      { label: "Casual", value: "casual", emoji: "☀️" },
      { label: "Office", value: "office", emoji: "💼" },
      { label: "Party", value: "party", emoji: "🎉" },
      { label: "Wedding", value: "wedding", emoji: "💍" },
    ],
    type: "card",
  },
  {
    key: "vibe",
    title: "What's your vibe?",
    subtitle: "Your personal style, your rules",
    options: [
      { label: "Minimal", value: "minimal", emoji: "🤍" },
      { label: "Bold", value: "bold", emoji: "🔥" },
      { label: "Classic", value: "classic", emoji: "⌚" },
      { label: "Trendy", value: "trendy", emoji: "✨" },
    ],
    type: "card",
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const current = STEPS[step]

  function select(value: string) {
    const updated = { ...answers, [current.key]: value }
    setAnswers(updated)

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 300)
    } else {
      // All done — go to lookbook with profile in URL params
      const params = new URLSearchParams(updated)
      router.push(`/lookbook?${params.toString()}`)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800">
        <motion.div
          className="h-full bg-white"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="w-full max-w-xl flex flex-col items-center gap-10"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            {/* Step indicator */}
            <p className="text-xs tracking-widest text-zinc-500 uppercase">
              Step {step + 1} of {STEPS.length}
            </p>

            {/* Question */}
            <div className="text-center">
              <h2 className="text-3xl font-light">{current.title}</h2>
              <p className="mt-2 text-zinc-400">{current.subtitle}</p>
            </div>

            {/* Options */}
            {current.type === "swatch" ? (
              <div className="flex gap-4 flex-wrap justify-center">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-14 h-14 rounded-full border-2 border-transparent group-hover:border-white transition-all"
                      style={{ backgroundColor: (opt as any).color }}
                    />
                    <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className="flex flex-col items-center gap-3 p-6 border border-zinc-800 hover:border-white hover:bg-zinc-900 transition-all"
                  >
                    <span className="text-3xl">{(opt as any).emoji}</span>
                    <span className="text-sm tracking-wide">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}