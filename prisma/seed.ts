import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const products = [
    {
      name: "White Linen Oversized Shirt",
      brand: "creosk Studio",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      category: "shirt",
      occasions: ["casual", "office"],
      vibes: ["minimal", "classic"],
      skinTones: ["warm", "cool", "neutral", "fair", "deep"],
      aiReason: "Clean lines work for all skin tones, perfect for daytime office looks",
    },
    {
      name: "Black Structured Blazer",
      brand: "creosk Studio",
      price: 3499,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      category: "top",
      occasions: ["office", "party"],
      vibes: ["bold", "classic"],
      skinTones: ["warm", "cool", "neutral", "fair", "deep"],
      aiReason: "Timeless and versatile, elevates any look instantly",
    },
    {
      name: "Floral Chiffon Blouse",
      brand: "creosk Studio",
      price: 999,
      imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400",
      category: "top",
      occasions: ["casual", "party", "wedding"],
      vibes: ["trendy", "bold"],
      skinTones: ["warm", "fair"],
      aiReason: "Warm floral tones complement warm and fair skin tones beautifully",
    },
    {
      name: "Navy Striped Polo",
      brand: "creosk Studio",
      price: 799,
      imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
      category: "shirt",
      occasions: ["casual", "office"],
      vibes: ["classic", "minimal"],
      skinTones: ["cool", "neutral", "deep"],
      aiReason: "Navy works especially well with cool and deep skin tones",
    },
    {
      name: "Rust Linen Co-ord Top",
      brand: "creosk Studio",
      price: 1599,
      imageUrl: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400",
      category: "top",
      occasions: ["casual", "party"],
      vibes: ["trendy", "bold"],
      skinTones: ["warm", "deep"],
      aiReason: "Earthy rust tones are stunning against warm and deep skin tones",
    },
    {
      name: "White Cotton Formal Shirt",
      brand: "creosk Studio",
      price: 1099,
      imageUrl: "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=400",
      category: "shirt",
      occasions: ["office", "wedding"],
      vibes: ["classic", "minimal"],
      skinTones: ["warm", "cool", "neutral", "fair", "deep"],
      aiReason: "A wardrobe essential that works for every skin tone and formal occasion",
    },
  ]

  for (const product of products) {
    await db.product.upsert({
      where: { id: "seed-" + product.name.toLowerCase().replace(/\s/g, "-") },
      update: {},
      create: { ...product, id: "seed-" + product.name.toLowerCase().replace(/\s/g, "-") },
    })
  }

  console.log("✅ Seeded 6 mock products")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())