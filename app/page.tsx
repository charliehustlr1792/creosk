"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function SplashPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-800" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs tracking-[0.4em] text-zinc-400 uppercase mb-3">
            Powered by AI
          </p>
          <h1 className="text-6xl font-light tracking-tight">
            CRE<span className="font-bold">OSK</span>
          </h1>
          <p className="mt-4 text-zinc-400 text-lg font-light">
            Try before you buy. Instantly.
          </p>
        </motion.div>

        <motion.button
          onClick={() => router.push("/profile")}
          className="mt-6 px-10 py-4 bg-white text-black font-medium tracking-wide hover:bg-zinc-200 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Your Style Session →
        </motion.button>

        <motion.p
          className="text-zinc-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          No account needed · Takes 30 seconds
        </motion.p>
      </motion.div>
    </main>
  )
}