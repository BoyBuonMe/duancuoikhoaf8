import type { ErrorRequestHandler } from "express";
import multer from "multer";
import {
  v2 as cloudinary,
  type UploadApiResponse,
} from "cloudinary";
import { httpError } from "@/utils/http-error";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_FILES = 8;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export interface UploadedAdminImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export const adminImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_FILES,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      callback(
        httpError("Only JPG, PNG, WEBP, and AVIF images are allowed", 400),
      );
      return;
    }

    callback(null, true);
  },
});

export const handleAdminImageUploadError: ErrorRequestHandler = (
  err,
  _req,
  _res,
  next,
) => {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "Each image must be 5MB or smaller",
      LIMIT_FILE_COUNT: `You can upload up to ${MAX_IMAGE_FILES} images at a time`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected upload field. Use field name "images"',
    };

    next(httpError(messages[err.code] ?? err.message, 400, err.code));
    return;
  }

  next(err);
};

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw httpError("Cloudinary upload is not configured", 503);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function uploadFile(file: Express.Multer.File): Promise<UploadedAdminImage> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "admin-products",
        resource_type: "image",
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );

    stream.end(file.buffer);
  });
}

export async function uploadAdminImages(files: Express.Multer.File[]) {
  if (!files.length) {
    throw httpError("At least one image is required", 400);
  }

  return Promise.all(files.map(uploadFile));
}
