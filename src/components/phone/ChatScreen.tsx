"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, Plus, Power, SendHorizontal } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import { GREETING } from "@/lib/assistant-prompt";
import StatusBar from "./StatusBar";

type Message = {
  id: number;
  from: "them" | "me";
  text: string;
  /** Message d'erreur (affiché différemment, jamais renvoyé au modèle). */
  error?: boolean;
};

const CONTACT = { name: "TwinsDev", avatar: "/brand/twinsdev-mark-v2.webp" };
const MAX_INPUT = 500;

/** Indicateur « est en train d'écrire » : trois points qui rebondissent. */
function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white/70"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

type Props = {
  onPowerOff: () => void;
  /** Bouton retour de l'en-tête : ouvre la connexion à l'espace d'administration. */
  onBack: () => void;
};

/** Écran allumé : messagerie avec l'assistant TwinsDev (réponses générées via /api/chat). */
export default function ChatScreen({ onPowerOff, onBack }: Props) {
  const clock = useClock();
  const reduce = useReducedMotion() ?? false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  // La saisie s'ouvre une fois l'accueil terminé (sinon un message d'accueil pourrait arriver après la réponse)
  const [ready, setReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const push = (message: Omit<Message, "id">) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, ...message }]);
    return id;
  };

  // Accueil : les premiers messages arrivent un à un (d'un coup en mouvement réduit)
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, reduce ? 0 : ms));
      });

    (async () => {
      await wait(500);
      for (const text of GREETING) {
        if (cancelled) return;
        setTyping(true);
        await wait(600 + Math.min(1000, text.length * 20));
        if (cancelled) return;
        setTyping(false);
        push({ from: "them", text });
        await wait(400);
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
      setTyping(false);
      timers.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Une requête en cours est annulée quand l'écran disparaît (extinction)
  useEffect(() => () => abortRef.current?.abort(), []);

  // Garde le dernier message visible
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, typing, reduce]);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || busy || !ready) return;
    setDraft("");
    setBusy(true);
    setTyping(true);

    // Historique envoyé au modèle : tout sauf les erreurs, plus le nouveau message
    const history = [
      ...messages.filter((m) => !m.error).map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })),
      { role: "user", content: text },
    ];
    push({ from: "me", text });

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(error ?? "Réponse indisponible");
      }

      // La bulle de réponse se remplit au fil du flux
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let id: number | null = null;
      let reply = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        if (id === null) {
          setTyping(false);
          id = push({ from: "them", text: reply });
        } else {
          const current = reply;
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: current } : m)));
        }
      }
      if (id === null) throw new Error("Réponse vide");
    } catch (error) {
      if (controller.signal.aborted) return;
      push({ from: "them", error: true, text: error instanceof Error ? error.message : "Réponse indisponible" });
    } finally {
      if (!controller.signal.aborted) {
        setTyping(false);
        setBusy(false);
        inputRef.current?.focus({ preventScroll: true });
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) void send();
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col text-white"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(110%_60%_at_50%_0%,rgba(34,197,94,0.20),transparent_60%),linear-gradient(180deg,#0c1422_0%,#070a12_100%)]"
      />
      {/* Fond d'écran : logo TwinsDev, dans la partie haute (les messages s'empilent en bas) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center">
        <Image
          src="/brand/twinsdev-logo-v2.webp"
          alt=""
          width={1000}
          height={761}
          sizes="240px"
          className="w-[70%] opacity-90 drop-shadow-[0_0_28px_rgba(255,255,255,0.18)]"
        />
      </div>

      <StatusBar time={clock?.time ?? null} className="relative" />

      {/* En-tête : contact + bouton d'extinction */}
      <header className="relative mt-3 flex items-center gap-2 border-b border-white/10 px-3 pb-2.5">
        {/* Flèche retour + icône TwinsDev : espace administrateur (directement si une session admin est ouverte) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Espace administrateur"
          title="Espace administrateur"
          className="-ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-full py-0.5 pr-0.5 text-accent-strong transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={22} aria-hidden />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1a14] ring-1 ring-white/15">
            <Image src={CONTACT.avatar} alt="" width={480} height={244} sizes="24px" className="h-auto w-[22px]" />
          </span>
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-semibold">{CONTACT.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-white/60">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            en ligne
          </p>
        </div>
        <button
          type="button"
          onClick={onPowerOff}
          aria-label="Éteindre le téléphone"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <Power size={18} strokeWidth={2.2} aria-hidden />
        </button>
      </header>

      {/* Fil de la conversation */}
      <div
        ref={listRef}
        role="log"
        aria-label={`Conversation avec ${CONTACT.name}`}
        aria-live="polite"
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 [scrollbar-width:none]"
      >
        <ul className="mt-auto flex flex-col gap-1.5">
          {messages.map((m) => (
            <motion.li
              key={m.id}
              className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                m.error
                  ? "self-start rounded-bl-md border border-red-400/40 bg-red-500/15 text-red-100"
                  : m.from === "me"
                    ? "self-end rounded-br-md bg-accent text-[#052e16]"
                    : "self-start rounded-bl-md bg-white/10 text-white"
              }`}
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              <span className="sr-only">{m.from === "me" ? "Vous : " : `${CONTACT.name} : `}</span>
              {m.text}
            </motion.li>
          ))}
          {typing && (
            <motion.li
              key="typing"
              aria-label={`${CONTACT.name} est en train d'écrire`}
              className="self-start rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TypingDots />
            </motion.li>
          )}
        </ul>
      </div>

      {/* Barre de saisie */}
      <form onSubmit={send} className="relative flex items-center gap-2 px-3 pb-7 pt-2">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80"
        >
          <Plus size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_INPUT))}
          onKeyDown={onKeyDown}
          placeholder={ready ? "Message" : "TwinsDev écrit…"}
          disabled={!ready}
          aria-label="Votre message"
          autoComplete="off"
          enterKeyHint="send"
          className="h-9 min-w-0 flex-1 rounded-full bg-white/10 px-3.5 text-[13px] text-white placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-white/40"
        />
        <button
          type="submit"
          disabled={!ready || busy || !draft.trim()}
          aria-label="Envoyer"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-[#052e16] transition-[opacity,transform] duration-150 active:scale-95 disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SendHorizontal size={17} strokeWidth={2.4} aria-hidden />
        </button>
      </form>
    </motion.div>
  );
}
