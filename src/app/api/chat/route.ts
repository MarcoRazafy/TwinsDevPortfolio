import { ASSISTANT_PROMPT } from "@/lib/assistant-prompt";
import { MistralError, hasApiKey, streamChat, type ChatMessage } from "@/lib/mistral";

/** Garde-fous : taille de l'historique envoyé au modèle et longueur d'un message. */
const MAX_MESSAGES = 24;
const MAX_LENGTH = 1500;

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages;
  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) continue;
    messages.push({ role, content: text.slice(0, MAX_LENGTH) });
  }
  // Seuls les derniers échanges comptent ; la conversation doit se terminer par le visiteur
  const recent = messages.slice(-MAX_MESSAGES);
  if (recent.length === 0 || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

/** POST /api/chat — { messages: [{ role: "user" | "assistant", content }] } → réponse en texte, streamée. */
export async function POST(request: Request) {
  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) return Response.json({ error: "Message invalide" }, { status: 400 });

  if (!hasApiKey()) {
    return Response.json(
      { error: "L'assistant n'est pas configuré : ajoute MISTRAL_API_KEY dans .env.local" },
      { status: 503 },
    );
  }

  try {
    const stream = await streamChat(ASSISTANT_PROMPT, messages, request.signal);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof MistralError) return Response.json({ error: error.message }, { status: error.status });
    console.error("[api/chat]", error);
    return Response.json({ error: "Le service de réponse est indisponible" }, { status: 502 });
  }
}
