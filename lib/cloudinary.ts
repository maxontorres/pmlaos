import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function extractPublicId(url: string): string | null {
  // Matches: .../upload/v12345/folder/name.ext  OR  .../upload/folder/name.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
  return match ? match[1] : null
}

export async function deleteCloudinaryImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return
  const publicIds = urls.map(extractPublicId).filter(Boolean) as string[]
  await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)))
}
