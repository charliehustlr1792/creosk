import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const occasion = searchParams.get("occasion")
  const vibe = searchParams.get("vibe")
  const skinTone = searchParams.get("skinTone")

  const products = await db.product.findMany({
    where: {
      inStock: true,
      ...(occasion && { occasions: { has: occasion } }),
      ...(vibe && { vibes: { has: vibe } }),
      ...(skinTone && { skinTones: { has: skinTone } }),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = await db.product.create({ data: body })
  return NextResponse.json(product)
}