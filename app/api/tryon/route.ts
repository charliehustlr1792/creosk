import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { callTryOnAPI } from "@/lib/tryon-api"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const personImage = formData.get("personImage") as Blob
  const clothingId = formData.get("clothingId") as string

  const product = await db.product.findUnique({ where: { id: clothingId } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  // Create session
  const session = await db.tryOnSession.create({
    data: { clothingId, status: "processing" },
  })

  try {
    const resultUrl = await callTryOnAPI(personImage, product.imageUrl)

    await db.tryOnSession.update({
      where: { id: session.id },
      data: { resultImageUrl: resultUrl, status: "done" },
    })

    return NextResponse.json({ resultUrl, sessionId: session.id })
  } catch (e) {
    await db.tryOnSession.update({
      where: { id: session.id },
      data: { status: "failed" },
    })
    return NextResponse.json({ error: "Try-on failed" }, { status: 500 })
  }
}