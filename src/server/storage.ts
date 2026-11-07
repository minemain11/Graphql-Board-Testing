import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * 이미지 저장소
 * - Vercel Blob이 연결돼 있으면(배포 환경) → Vercel Blob에 저장하고 https 주소를 돌려줌
 * - 아니면(내 컴퓨터) → .local-data/uploads 폴더에 저장하고 /api/uploads/파일이름 주소를 돌려줌
 */

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".local-data", "uploads");
const LOCAL_URL_PREFIX = "/api/uploads/";

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const CONTENT_TYPES = Object.fromEntries(
  Object.entries(IMAGE_EXTENSIONS).map(([type, ext]) => [ext, type])
);

const LOCAL_FILE_NAME = /^[a-zA-Z0-9-]+\.(jpg|png|webp|gif)$/;

/** 이미지를 저장하고 화면에서 쓸 주소를 돌려줍니다. */
export async function saveImage(file: File): Promise<string> {
  const extension = IMAGE_EXTENSIONS[file.type];
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;

  if (USE_BLOB) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`talkr/${fileName}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "이미지 저장소가 없습니다. Vercel 프로젝트의 Storage 탭에서 Blob(Public)을 연결해 주세요."
    );
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `${LOCAL_URL_PREFIX}${fileName}`;
}

/** 이 서비스가 저장한 이미지 주소인지 확인합니다. (다른 사이트 이미지 주소는 저장하지 않기 위함) */
export function isOwnImageUrl(url: string) {
  if (url.startsWith(LOCAL_URL_PREFIX)) {
    return LOCAL_FILE_NAME.test(url.slice(LOCAL_URL_PREFIX.length));
  }
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** 더 이상 쓰지 않는 이미지를 지웁니다. (실패해도 게시글 처리에는 영향 없음) */
export async function deleteImages(urls: string[]) {
  if (urls.length === 0) return;
  try {
    const blobUrls = urls.filter((url) => url.startsWith("https://"));
    if (USE_BLOB && blobUrls.length > 0) {
      const { del } = await import("@vercel/blob");
      await del(blobUrls);
    }
    const localNames = urls
      .filter((url) => url.startsWith(LOCAL_URL_PREFIX))
      .map((url) => url.slice(LOCAL_URL_PREFIX.length))
      .filter((name) => LOCAL_FILE_NAME.test(name));
    await Promise.all(
      localNames.map((name) => unlink(path.join(LOCAL_UPLOAD_DIR, name)).catch(() => undefined))
    );
  } catch (error) {
    console.error("[storage] 이미지 삭제 실패", error);
  }
}

/** (내 컴퓨터 전용) 저장해 둔 이미지 파일을 읽어옵니다. */
export async function readLocalImage(name: string) {
  if (process.env.VERCEL || !LOCAL_FILE_NAME.test(name)) return null;
  try {
    const bytes = await readFile(path.join(LOCAL_UPLOAD_DIR, name));
    const extension = name.split(".").pop() ?? "";
    return { bytes, contentType: CONTENT_TYPES[extension] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
