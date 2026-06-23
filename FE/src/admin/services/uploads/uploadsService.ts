import http from "@/admin/utils/http";

export interface UploadedAdminImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UploadAdminImagesResponse {
  images: UploadedAdminImage[];
}

export function uploadAdminProductImages(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  return http.post<UploadAdminImagesResponse>(
    "/admin/uploads/images",
    formData,
  );
}
