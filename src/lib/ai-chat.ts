import "server-only";

/**
 * Client minimal pour une API de chat au format « chat completions » en streaming (Mistral, Groq,
 * Google Gemini, OpenRouter… parlent tous ce format). Aucune dépendance.
 *
 * Configuration (.env.local) — les trois ensemble pour changer de fournisseur :
 *   AI_BASE_URL  adresse de l'API, version comprise (ex. https://api.groq.com/openai/v1)
 *   AI_MODEL     nom du modèle chez ce fournisseur
 *   AI_API_KEY   clé du fournisseur
 * Sans AI_*, les anciennes variables MISTRAL_API_KEY / MISTRAL_MODEL / MISTRAL_BASE_URL restent prises en compte.
 */

type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

const MAX_TOKENS = 300;

/* Variables lues à chaque appel : un changement de .env.local est pris en compte sans redémarrage. */
const apiKey = () => process.env.AI_API_KEY || process.env.MISTRAL_API_KEY || "";
const endpoint = () => {
  const base = process.env.AI_BASE_URL || `${(process.env.MISTRAL_BASE_URL || "https://api.mistral.ai").replace(/\/$/, "")}/v1`;
  return `${base.replace(/\/$/, "")}/chat/completions`;
};
const model = () => process.env.AI_MODEL || process.env.MISTRAL_MODEL || "mistral-small-latest";
/** Modèles de secours (séparés par des virgules), essayés si le modèle principal refuse (limite, offre). */
const fallbackModels = () =>
  (process.env.AI_FALLBACK_MODELS || process.env.MISTRAL_FALLBACK_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

export class AiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function hasApiKey(): boolean {
  return Boolean(apiKey());
}

/**
 * Lance une complétion en streaming et renvoie un flux de texte brut (UTF-8) : seuls les morceaux de
 * réponse sont transmis, le format SSE du fournisseur est décodé ici.
 */
export async function streamChat(
  system: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const key = apiKey();
  if (!key) throw new AiError("Clé d'API absente", 503);

  // Modèle principal, puis les modèles de secours si le fournisseur refuse (limite atteinte, modèle hors offre)
  const models = [model(), ...fallbackModels()];
  let lastError = new AiError("Le service de réponse est indisponible", 502);
  for (const [i, name] of models.entries()) {
    const upstream = await fetch(endpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: name,
        messages: [{ role: "system", content: system }, ...messages],
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
        stream: true,
      }),
      signal,
    });

    if (upstream.ok && upstream.body) return upstream.body.pipeThrough(sseToText());

    const detail = await upstream.text().catch(() => "");
    console.error(`[ai-chat] ${name} : ${upstream.status} ${detail.slice(0, 300)}`);
    if (upstream.status === 401) throw new AiError("Clé d'API refusée", 503);
    lastError =
      upstream.status === 429
        ? new AiError("Limite de requêtes atteinte", 429)
        : upstream.status === 403
          ? new AiError("Modèle non inclus dans l'offre", 503)
          : new AiError("Le service de réponse est indisponible", 502);
    // Seuls « limite atteinte » et « modèle hors offre » justifient d'essayer le modèle suivant
    if (![403, 429].includes(upstream.status) || i === models.length - 1) break;
  }
  throw lastError;
}

/** Transforme les événements `data: {...}` de Mistral en texte : on ne garde que `choices[0].delta.content`. */
function sseToText(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const handleLine = (line: string, controller: TransformStreamDefaultController<Uint8Array>) => {
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    try {
      const json = JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[] };
      const text = json.choices?.[0]?.delta?.content;
      if (text) controller.enqueue(encoder.encode(text));
    } catch {
      // Ligne incomplète ou événement inconnu : ignoré
    }
  };

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line, controller);
    },
    flush(controller) {
      if (buffer) handleLine(buffer, controller);
    },
  });
}
