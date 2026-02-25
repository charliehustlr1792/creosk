// Swap VITON_API_URL in .env.local when real backend is ready
export async function callTryOnAPI(
  personImageBlob: Blob,
  clothingImageUrl: string
): Promise<string> {
  const VITON_URL = process.env.VITON_API_URL

  // If no backend yet, return mock result after fake delay
  if (!VITON_URL || VITON_URL === "mock") {
    await new Promise(r => setTimeout(r, 3000))
    return clothingImageUrl // returns clothing image as placeholder result
  }

  // Fetch clothing image and convert to blob
  const clothRes = await fetch(clothingImageUrl)
  const clothBlob = await clothRes.blob()

  const formData = new FormData()
  formData.append("model", personImageBlob, "person.jpg")
  formData.append("cloth", clothBlob, "cloth.jpg")

  const res = await fetch(`${VITON_URL}/api/transform`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) throw new Error("ViTON API failed")

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}