const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export type AvatarFileValidation =
  | { ok: true; extension: "jpg" | "jpeg" | "png"; contentType: "image/jpeg" | "image/png" }
  | { ok: false; message: string };

function bytesStartWith(bytes: Uint8Array, magic: number[]) {
  if (bytes.length < magic.length) {
    return false;
  }
  return magic.every((value, index) => bytes[index] === value);
}

export async function validateAvatarFile(file: File): Promise<AvatarFileValidation> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Avatar file is required." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "Avatar must be 2 MB or smaller." };
  }

  const name = file.name.toLowerCase();
  const extension = name.includes(".") ? name.split(".").pop() ?? "" : "";
  const ext = extension === "jpg" || extension === "jpeg" || extension === "png" ? extension : null;

  if (!ext) {
    return { ok: false, message: "Only .jpg, .jpeg, or .png files are allowed." };
  }

  if (
    file.type !== "image/jpeg" &&
    file.type !== "image/png" &&
    file.type !== "application/octet-stream"
  ) {
    return { ok: false, message: "Invalid avatar content type. Only JPG or PNG is allowed." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPng = bytesStartWith(bytes, PNG_MAGIC);
  const isJpeg = bytesStartWith(bytes, JPEG_MAGIC);

  if (!isPng && !isJpeg) {
    return { ok: false, message: "File signature is invalid. Upload a real JPG or PNG image." };
  }

  if ((ext === "png" && !isPng) || ((ext === "jpg" || ext === "jpeg") && !isJpeg)) {
    return {
      ok: false,
      message: "File extension does not match file content. Upload a valid JPG or PNG image.",
    };
  }

  return {
    ok: true,
    extension: ext,
    contentType: isPng ? "image/png" : "image/jpeg",
  };
}

export function avatarPathForUser(userId: string, extension: "jpg" | "jpeg" | "png") {
  return `${userId}/${crypto.randomUUID()}.${extension === "jpeg" ? "jpg" : extension}`;
}
