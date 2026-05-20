const MAX_SUBMISSION_FILE_BYTES = 5 * 1024 * 1024;
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

type AllowedExt = "jpg" | "jpeg" | "png" | "pdf";
type AllowedMime = "image/jpeg" | "image/png" | "application/pdf";

export type SubmissionFileValidation =
  | { ok: true; extension: AllowedExt; contentType: AllowedMime }
  | { ok: false; message: string };

function bytesStartWith(bytes: Uint8Array, magic: number[]) {
  if (bytes.length < magic.length) {
    return false;
  }

  return magic.every((value, index) => bytes[index] === value);
}

export async function validateSubmissionFile(
  file: File
): Promise<SubmissionFileValidation> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Evidence file is required." };
  }

  if (file.size > MAX_SUBMISSION_FILE_BYTES) {
    return { ok: false, message: "Evidence file must be 5 MB or smaller." };
  }

  const name = file.name.toLowerCase();
  const extension = name.includes(".") ? name.split(".").pop() ?? "" : "";
  const ext =
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "pdf"
      ? (extension as AllowedExt)
      : null;

  if (!ext) {
    return { ok: false, message: "Only .pdf, .jpg, .jpeg, or .png files are allowed." };
  }

  if (
    file.type !== "image/jpeg" &&
    file.type !== "image/png" &&
    file.type !== "application/pdf" &&
    file.type !== "application/octet-stream"
  ) {
    return {
      ok: false,
      message: "Invalid file type. Upload a PDF, JPG, JPEG, or PNG file.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPng = bytesStartWith(bytes, PNG_MAGIC);
  const isJpeg = bytesStartWith(bytes, JPEG_MAGIC);
  const isPdf = bytesStartWith(bytes, PDF_MAGIC);

  if (!isPng && !isJpeg && !isPdf) {
    return {
      ok: false,
      message:
        "File signature is invalid. Upload a real PDF, JPG, JPEG, or PNG file.",
    };
  }

  if (ext === "png" && !isPng) {
    return {
      ok: false,
      message: "File extension does not match file content. Upload a valid PNG file.",
    };
  }

  if ((ext === "jpg" || ext === "jpeg") && !isJpeg) {
    return {
      ok: false,
      message: "File extension does not match file content. Upload a valid JPG/JPEG file.",
    };
  }

  if (ext === "pdf" && !isPdf) {
    return {
      ok: false,
      message: "File extension does not match file content. Upload a valid PDF file.",
    };
  }

  const contentType: AllowedMime = isPdf
    ? "application/pdf"
    : isPng
      ? "image/png"
      : "image/jpeg";

  return { ok: true, extension: ext, contentType };
}

export function submissionArtifactPath(
  userId: string,
  submissionId: string,
  extension: AllowedExt
) {
  return `${userId}/${submissionId}/${crypto.randomUUID()}.${extension}`;
}
