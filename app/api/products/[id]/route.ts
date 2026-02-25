import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}