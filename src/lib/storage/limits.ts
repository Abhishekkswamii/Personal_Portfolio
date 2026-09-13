/**
 * Upload limits, safe to import from client components.
 *
 * Kept in step with the server by reading the same env var. The server is
 * still the authority — this only stops the UI from promising something the
 * upload endpoint would reject.
 */
export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 12);

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/avif";

export const ACCEPTED_LABEL = "JPEG, PNG, WebP or AVIF";
