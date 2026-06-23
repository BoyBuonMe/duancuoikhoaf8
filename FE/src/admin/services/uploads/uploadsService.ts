import http from "@/admin/utils/http";

export interface UploadedAdminImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export async function uploadAdminProductImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  return http.post<{ images: UploadedAdminImage[] }>(
    "/admin/uploads/images",
    formData,
  );
}
