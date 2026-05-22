const MAX_CASE_DOCUMENT_BYTES = 5 * 1024 * 1024;
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

export type CaseDocumentValidation =
  | {
      ok: true;
      extension: "pdf";
      contentType: "application/pdf";
    }
  | {
      ok: false;
      message: string;
    };

function bytesStartWith(bytes: Uint8Array, magic: number[]) {
  if (bytes.length < magic.length) {
    return false;
  }

  return magic.every((value, index) => bytes[index] === value);
}

export async function validateCaseDocumentFile(
  file: File
): Promise<CaseDocumentValidation> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Document file is required." };
  }

  if (file.size > MAX_CASE_DOCUMENT_BYTES) {
    return { ok: false, message: "Document must be 5 MB or smaller." };
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".pdf")) {
    return { ok: false, message: "Only PDF documents are allowed." };
  }

  if (
    file.type !== "application/pdf" &&
    file.type !== "application/octet-stream"
  ) {
    return { ok: false, message: "Invalid file type. Only PDF is allowed." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf = bytesStartWith(bytes, PDF_MAGIC);
  if (!isPdf) {
    return { ok: false, message: "Invalid PDF signature." };
  }

  return { ok: true, extension: "pdf", contentType: "application/pdf" };
}

export function caseDocumentArtifactPath(
  userId: string,
  caseId: string,
  kind: "finding" | "mitigation"
) {
  return `${userId}/${caseId}/${kind}/${crypto.randomUUID()}.pdf`;
}
