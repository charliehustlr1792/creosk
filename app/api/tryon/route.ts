import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const personImage = formData.get("personImage") as Blob
  const clothingId = formData.get("clothingId") as string

  const product = await db.product.findUnique({ where: { id: clothingId } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const session = await db.tryOnSession.create({
    data: { clothingId, status: "processing" },
  })

  try {
    const VITON_URL = process.env.VITON_API_URL

    if (!VITON_URL || VITON_URL === "mock") {
      // Mock: return the clothing image itself as result
      await new Promise(r => setTimeout(r, 3000))
      await db.tryOnSession.update({
        where: { id: session.id },
        data: { status: "done" },
      })
      return NextResponse.json({ resultUrl: product.imageUrl })
    }

    // Fetch clothing image
    const clothRes = await fetch(product.imageUrl)
    const clothBlob = await clothRes.blob()

    // Build form data for ViTON
    const vitonForm = new FormData()
    vitonForm.append("model", personImage, "person.jpg")
    vitonForm.append("cloth", clothBlob, "cloth.jpg")

    const vitonRes = await fetch(`${VITON_URL}/api/transform`, {
      method: "POST",
      body: vitonForm,
    })

    if (!vitonRes.ok) throw new Error("ViTON failed")

    // Convert result to base64 so frontend can display it directly
    const resultBuffer = await vitonRes.arrayBuffer()
    const base64 = Buffer.from(resultBuffer).toString("base64")
    const resultUrl = `data:image/jpeg;base64,${base64}`

    await db.tryOnSession.update({
      where: { id: session.id },
      data: { status: "done" },
    })

    return NextResponse.json({ resultUrl })

  } catch (e) {
    console.error(e)
    await db.tryOnSession.update({
      where: { id: session.id },
      data: { status: "failed" },
    })
    return NextResponse.json({ error: "Try-on failed" }, { status: 500 })
  }
}