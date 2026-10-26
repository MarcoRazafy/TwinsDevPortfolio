import "server-only";

/** Client minimal pour l'API Mistral (chat completions, en streaming). Aucune dépendance. */

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

const MAX_TOKENS = 300;

/* Variables lues à chaque appel : un changement de .env.local est pris en compte sans redémarrage. */
const baseUrl = () => (process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai").replace(/\/$/, "");
const model = () => process.env.MISTRAL_MODEL ?? "mistral-small-latest";

export class MistralError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function hasApiKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

/**
 * Lance une complétion en streaming et renvoie un flux de texte brut (UTF-8) : seuls les morceaux de
 * réponse sont transmis, le format SSE de Mistral est décodé ici.
 */
export async function streamChat(
  system: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new MistralError("Clé MISTRAL_API_KEY absente", 503);

  const upstream = await fetch(`${baseUrl()}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: model(),
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: MAX_TOKENS,
      temperature: 0.6,
      stream: true,
    }),
    signal,
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`[mistral] ${upstream.status} ${detail.slice(0, 300)}`);
    if (upstream.status === 401) throw new MistralError("Clé Mistral refusée", 503);
    if (upstream.status === 429) throw new MistralError("Trop de demandes en ce moment, réessaie dans un instant", 429);
    throw new MistralError("Le service de réponse est indisponible", 502);
  }

  return upstream.body.pipeThrough(sseToText());
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
