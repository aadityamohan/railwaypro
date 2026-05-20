import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch {
    // ignore if file doesn't exist
  }
}

export function inventoryBillPath(itemId: string, fileName: string) {
  return `inventory/${itemId}/bill_${Date.now()}_${fileName}`
}

export function equipmentImagePath(equipmentId: string, fileName: string) {
  return `equipment/${equipmentId}/image_${Date.now()}_${fileName}`
}
