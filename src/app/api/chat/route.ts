import { AiError, hasApiKey, streamChat, type ChatMessage } from "@/lib/ai-chat";
import { ASSISTANT_PROMPT } from "@/lib/assistant-prompt";
import { getContent } from "@/lib/content/store";
import { localReply } from "@/lib/local-assistant";

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

const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

/** Réponse de l'assistant de secours (gratuit, sans service externe) à partir des contenus du site. */
async function fallback(messages: ChatMessage[], reason: string) {
  console.warn(`[api/chat] assistant local utilisé : ${reason}`);
  const { projects, categories } = await getContent();
  const reply = localReply(messages, projects, categories);
  return new Response(reply, { headers: { ...TEXT_HEADERS, "X-Assistant": "local" } });
}

/**
 * POST /api/chat — { messages: [{ role: "user" | "assistant", content }] } → réponse en texte, streamée.
 * Modèle d'IA si une clé est configurée ; sinon, ou s'il est indisponible (limite, panne), assistant local.
 */
export async function POST(request: Request) {
  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) return Response.json({ error: "Message invalide" }, { status: 400 });

  if (!hasApiKey()) return fallback(messages, "aucune clé d'API");

  try {
    const stream = await streamChat(ASSISTANT_PROMPT, messages, request.signal);
    return new Response(stream, { headers: { ...TEXT_HEADERS, "X-Assistant": "ai" } });
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    if (error instanceof AiError) return fallback(messages, `${error.status} ${error.message}`);
    console.error("[api/chat]", error);
    return fallback(messages, "erreur réseau");
  }
}
