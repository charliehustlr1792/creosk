import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Client } from "@gradio/client"

export async function POST(req: NextRequest) {
  const { productId, userImageBase64 } = await req.json()

  if (!productId || !userImageBase64) {
    return NextResponse.json({ error: "Missing productId or image" }, { status: 400 })
  }

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const clothUrl = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : `${baseUrl}${product.imageUrl}`

  try {
    // Convert base64 person image to blob
    const base64Data = userImageBase64.replace(/^data:image\/\w+;base64,/, "")
    const personBuffer = Buffer.from(base64Data, "base64")
    const personBlob = new Blob([personBuffer], { type: "image/png" })

    // Fetch cloth image
    const clothRes = await fetch(clothUrl)
    const clothBlob = await clothRes.blob()

    console.log("🚀 Connecting to IDM-VTON...")
    const client = await Client.connect("yisol/IDM-VTON")

    console.log("🚀 Running try-on...")
    const result = await client.predict("/tryon", {
      dict: { background: personBlob, layers: [], composite: null },
      garm_img: clothBlob,
      garment_des: product.name,
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42,
    })

    const resultData = result.data as any[]
    const resultImage = resultData[0]

    console.log("✅ Try-on complete:", resultImage)
    console.log("Result data:", JSON.stringify(resultData[0]))
    return NextResponse.json({ resultUrl: resultImage.url })
  } catch (error: any) {
    console.error("IDM-VTON error:", error)
    return NextResponse.json(
      { error: `Try-on failed: ${error.message}` },
      { status: 500 }
    )
  }
}