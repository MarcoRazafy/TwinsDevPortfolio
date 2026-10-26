import { readUpload } from "@/lib/content/uploads";

/** GET /media/<fichier> — images envoyées depuis l'administration (data/uploads). Noms uniques : cache long. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const upload = await readUpload(file);
  if (!upload) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
