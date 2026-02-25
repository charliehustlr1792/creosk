import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { contact, productId } = await req.json()
  const lead = await db.leadCapture.create({ data: { contact, productId } })
  return NextResponse.json(lead)
}