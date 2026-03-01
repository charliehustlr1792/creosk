import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  await db.product.deleteMany({})
  console.log("🗑️ Cleared existing products")

  const products = [
    {
      id: "seed-001",
      name: "Classic White Oxford Shirt",
      brand: "Creosk Studio",
      price: 1299,
      imageUrl: "/uploads/cloth1.jpg",
      category: "shirt",
      occasions: ["office", "wedding"],
      vibes: ["classic", "minimal"],
      skinTones: ["fair", "warm", "cool", "neutral", "deep"],
      aiReason: "A timeless wardrobe essential that suits every skin tone",
    },
    {
      id: "seed-002",
      name: "Navy Blue Formal Shirt",
      brand: "Creosk Studio",
      price: 1499,
      imageUrl: "/uploads/cloth2.jpg",
      category: "shirt",
      occasions: ["office", "party"],
      vibes: ["classic", "bold"],
      skinTones: ["fair", "warm", "neutral"],
      aiReason: "Deep navy complements warm and neutral skin tones beautifully",
    },
    {
      id: "seed-003",
      name: "Striped Cotton Casual",
      brand: "Creosk Studio",
      price: 999,
      imageUrl: "/uploads/cloth3.jpg",
      category: "shirt",
      occasions: ["casual", "office"],
      vibes: ["classic", "minimal"],
      skinTones: ["cool", "neutral", "deep"],
      aiReason: "Clean stripes work especially well with cool undertones",
    },
    {
      id: "seed-004",
      name: "Floral Print Top",
      brand: "Creosk Studio",
      price: 849,
      imageUrl: "/uploads/cloth4.jpg",
      category: "top",
      occasions: ["casual", "party"],
      vibes: ["trendy", "bold"],
      skinTones: ["warm", "fair", "deep"],
      aiReason: "Warm tones in the print bring out warmth in your complexion",
    },
    {
      id: "seed-005",
      name: "Minimal Linen Shirt",
      brand: "Creosk Studio",
      price: 1199,
      imageUrl: "/uploads/cloth5.jpg",
      category: "shirt",
      occasions: ["casual", "wedding"],
      vibes: ["minimal", "classic"],
      skinTones: ["fair", "warm", "neutral", "cool", "deep"],
      aiReason: "Neutral linen tones are universally flattering",
    },
    {
      id: "seed-006",
      name: "Relaxed Fit Casual Shirt",
      brand: "Creosk Studio",
      price: 899,
      imageUrl: "/uploads/cloth6.jpg",
      category: "shirt",
      occasions: ["casual"],
      vibes: ["minimal", "trendy"],
      skinTones: ["warm", "neutral", "deep"],
      aiReason: "Easy relaxed fit that works great for warm and deep skin tones",
    },
    {
      id: "seed-007",
      name: "Bold Printed Shirt",
      brand: "Creosk Studio",
      price: 1099,
      imageUrl: "/uploads/cloth7.jpg",
      category: "shirt",
      occasions: ["party", "casual"],
      vibes: ["bold", "trendy"],
      skinTones: ["cool", "neutral", "deep"],
      aiReason: "Statement prints stand out beautifully on cool and deep tones",
    },
    {
      id: "seed-008",
      name: "Charcoal Slim Fit Shirt",
      brand: "Creosk Studio",
      price: 1599,
      imageUrl: "/uploads/cloth8.jpg",
      category: "shirt",
      occasions: ["office", "party"],
      vibes: ["classic"],
      skinTones: ["neutral", "deep"],
      aiReason: "Charcoal offers a sleek contrast for neutral undertones",
    },
    {
      id: "seed-009",
      name: "Pastel Peach Casual Top",
      brand: "Creosk Studio",
      price: 899,
      imageUrl: "/uploads/cloth9.jpg",
      category: "top",
      occasions: ["casual"],
      vibes: ["minimal", "trendy"],
      skinTones: ["fair", "warm"],
      aiReason: "Peach hues enhance warmth in lighter complexions",
    },
    {
      id: "seed-010",
      name: "Emerald Green Party Shirt",
      brand: "Creosk Studio",
      price: 1699,
      imageUrl: "/uploads/cloth10.jpg",
      category: "shirt",
      occasions: ["party", "wedding"],
      vibes: ["bold"],
      skinTones: ["deep", "neutral"],
      aiReason: "Emerald green creates a luxurious contrast on deeper tones",
    },
    {
      id: "seed-011",
      name: "Soft Beige Everyday Shirt",
      brand: "Creosk Studio",
      price: 1099,
      imageUrl: "/uploads/cloth11.jpg",
      category: "shirt",
      occasions: ["casual", "office"],
      vibes: ["minimal"],
      skinTones: ["warm", "neutral", "fair"],
      aiReason: "Beige tones offer subtle elegance for everyday wear",
    },
    {
      id: "seed-012",
      name: "Midnight Black Formal Shirt",
      brand: "Creosk Studio",
      price: 1799,
      imageUrl: "/uploads/cloth12.jpg",
      category: "shirt",
      occasions: ["office", "wedding", "party"],
      vibes: ["classic", "bold"],
      skinTones: ["fair", "warm", "cool", "neutral", "deep"],
      aiReason: "Black is universally flattering and always in style",
    },
  ]

  for (const product of products) {
    await db.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    })
    console.log(`✅ ${product.name}`)
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())