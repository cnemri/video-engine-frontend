import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "./firebase"; // Need to export app from firebase.ts

const storage = getStorage(app);

export async function getStorageUrl(path: string): Promise<string | null> {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already a URL
    try {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
    } catch (e) {
        console.error(`Failed to get URL for ${path}:`, e);
        return null;
    }
}
