import { useState } from "react";
import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

/**
 * Returns an `openCv(url)` function that fetches a server-signed Cloudinary
 * URL then opens it in a new tab. Falls back to the raw URL on error.
 */
export function useOpenCv() {
  const [loading, setLoading] = useState(false);

  const openCv = async (storedUrl: string) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<{ url: string }>>(
        `/upload/cv-signed-url?url=${encodeURIComponent(storedUrl)}`,
      );
      window.open(res.data.data.url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(storedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return { openCv, loading };
}
