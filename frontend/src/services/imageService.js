/**
 * ============================================================
 * CityPulse AI
 * Image Evidence Service
 * ============================================================
 *
 * Current:
 * - Browser camera
 * - Gallery upload
 * - Image validation
 * - Image compression
 * - LocalStorage persistence
 *
 * Future:
 * - Backend upload
 * - Cloud/object storage
 * - Signed image URLs
 * - Virus/content validation
 */

const IMAGE_KEY = "citypulse_report_images";

export const IMAGE_LIMITS = {
  maxFiles: 5,
  maxFileSizeMB: 10,
  maxFileSizeBytes: 10 * 1024 * 1024,

  maxWidth: 1600,
  maxHeight: 1600,

  quality: 0.82
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

function safeRead() {
  try {
    const value =
      localStorage.getItem(IMAGE_KEY);

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function safeWrite(images) {
  try {
    localStorage.setItem(
      IMAGE_KEY,
      JSON.stringify(images)
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Read saved evidence images.
 */
export function getReportImages() {
  return safeRead();
}

/**
 * Save evidence images.
 */
export function saveReportImages(images) {
  const safeImages =
    Array.isArray(images)
      ? images.slice(0, IMAGE_LIMITS.maxFiles)
      : [];

  safeWrite(safeImages);

  return safeImages;
}

/**
 * Clear evidence.
 */
export function clearReportImages() {
  try {
    localStorage.removeItem(
      IMAGE_KEY
    );
  } catch {}
}

/**
 * Validate a browser File.
 */
export function validateImageFile(file) {
  if (!file) {
    return {
      valid: false,
      error: "No image selected."
    };
  }

  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return {
      valid: false,
      error:
        "Only JPG, PNG or WebP images are supported."
    };
  }

  if (
    file.size >
    IMAGE_LIMITS.maxFileSizeBytes
  ) {
    return {
      valid: false,
      error:
        `Image must be smaller than ${IMAGE_LIMITS.maxFileSizeMB} MB.`
    };
  }

  return {
    valid: true,
    error: ""
  };
}

/**
 * Convert File → data URL.
 */
export function fileToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error(
            "Unable to read image."
          )
        );

      reader.readAsDataURL(file);
    }
  );
}

/**
 * Load image element from a data URL.
 */
function loadImage(dataUrl) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Unable to process image."
          )
        );

      image.src = dataUrl;
    }
  );
}

/**
 * Resize and compress image.
 *
 * This prevents LocalStorage from becoming
 * unnecessarily large and also gives the future
 * backend a predictable image size.
 */
export async function compressImage(
  file
) {
  const originalUrl =
    await fileToDataUrl(file);

  const image =
    await loadImage(
      originalUrl
    );

  const originalWidth =
    image.naturalWidth ||
    image.width;

  const originalHeight =
    image.naturalHeight ||
    image.height;

  let width =
    originalWidth;

  let height =
    originalHeight;

  const maxWidth =
    IMAGE_LIMITS.maxWidth;

  const maxHeight =
    IMAGE_LIMITS.maxHeight;

  const scale =
    Math.min(
      1,
      maxWidth / width,
      maxHeight / height
    );

  width =
    Math.max(
      1,
      Math.round(width * scale)
    );

  height =
    Math.max(
      1,
      Math.round(height * scale)
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return {
      dataUrl: originalUrl,
      width: originalWidth,
      height: originalHeight,
      originalSize: file.size,
      compressedSize: file.size,
      type: file.type
    };
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  const dataUrl =
    canvas.toDataURL(
      "image/jpeg",
      IMAGE_LIMITS.quality
    );

  const estimatedSize =
    Math.round(
      (dataUrl.length * 3) / 4
    );

  return {
    dataUrl,

    width,
    height,

    originalWidth,
    originalHeight,

    originalSize:
      file.size,

    compressedSize:
      estimatedSize,

    type:
      "image/jpeg",

    name:
      file.name,

    createdAt:
      new Date().toISOString()
  };
}

/**
 * Convert multiple Files to evidence objects.
 */
export async function filesToImages(
  files
) {
  const incoming =
    Array.from(files || []);

  const results = [];

  for (
    const file of incoming
  ) {
    if (
      results.length >=
      IMAGE_LIMITS.maxFiles
    ) {
      break;
    }

    const validation =
      validateImageFile(file);

    if (!validation.valid) {
      results.push({
        error:
          validation.error,
        fileName:
          file.name
      });

      continue;
    }

    try {
      const compressed =
        await compressImage(
          file
        );

      results.push({
        ...compressed,

        id:
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,

        source:
          "camera-or-gallery"
      });
    } catch {
      results.push({
        error:
          "Could not process this image.",
        fileName:
          file.name
      });
    }
  }

  return results;
}

/**
 * Get human-readable file size.
 */
export function formatImageSize(
  bytes
) {
  if (!bytes) {
    return "0 KB";
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

/**
 * Merge new images into existing evidence.
 */
export function mergeImages(
  existing,
  incoming
) {
  const current =
    Array.isArray(existing)
      ? existing
      : [];

  const next =
    Array.isArray(incoming)
      ? incoming
      : [];

  return [
    ...current,
    ...next
  ].slice(
    0,
    IMAGE_LIMITS.maxFiles
  );
}
