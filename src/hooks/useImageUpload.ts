import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const upload = async (file: File): Promise<string | null> => {
    if (!ALLOWED.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WEBP.", variant: "destructive" });
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "Arquivo grande", description: "Máximo 5MB.", variant: "destructive" });
      return null;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      toast({ title: "Erro ao enviar imagem", description: msg, variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
