"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CheckCheck, ChevronLeft, Power, SendHorizontal } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import { GREETING } from "@/lib/assistant-prompt";
import StatusBar from "./StatusBar";

type Message = {
  id: number;
  from: "them" | "me";
  text: string;
  /** Heure d'envoi, « 16:05 ». */
  at: string;
  /** Message d'erreur (affiché différemment, jamais renvoyé au modèle). */
  error?: boolean;
};

const CONTACT = { name: "TwinsDev", avatar: "/brand/twinsdev-mark-v2.webp" };
const MAX_INPUT = 500;
/** Le compteur de caractères n'apparaît qu'à l'approche de la limite. */
const COUNTER_FROM = 400;

/** Suggestions affichées après l'accueil : un toucher suffit pour lancer la conversation. */
const QUICK_REPLIES = [
  { label: "Un site web", message: "J'aimerais un site web" },
  { label: "Une application", message: "J'ai un projet d'application" },
  { label: "Un serveur VPS", message: "Vous configurez des serveurs VPS ?" },
  { label: "Vos tarifs", message: "Combien ça coûte ?" },
];

const nowLabel = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Petit avatar TwinsDev, à côté de ses messages. */
function Avatar() {
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0b1a14] ring-1 ring-white/15">
      <Image src={CONTACT.avatar} alt="" width={480} height={244} sizes="16px" className="h-auto w-[14px]" />
    </span>
  );
}

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
  /** Premier message du visiteur : la conversation commence (les cartes décoratives s'écartent). */
  onConversationStart?: () => void;
};

/** Écran allumé : messagerie avec l'assistant TwinsDev (réponses générées via /api/chat). */
export default function ChatScreen({ onPowerOff, onBack, onConversationStart }: Props) {
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
  // Messages d'accueil déjà affichés : si l'effet est relancé (rechargement à chaud en développement), pas de doublon
  const greeted = useRef(0);

  const push = (message: Omit<Message, "id" | "at">) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, at: nowLabel(), ...message }]);
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
      if (greeted.current < GREETING.length) await wait(500);
      // On reprend là où l'accueil s'était arrêté : chaque message n'est affiché qu'une fois
      for (const text of GREETING.slice(greeted.current)) {
        if (cancelled) return;
        setTyping(true);
        await wait(600 + Math.min(1000, text.length * 20));
        if (cancelled) return;
        setTyping(false);
        greeted.current += 1;
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

  /** Envoie le brouillon, ou `preset` (suggestion de réponse). */
  const send = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const text = (preset ?? draft).trim();
    if (!text || busy || !ready) return;
    if (preset === undefined) setDraft("");
    setBusy(true);
    setTyping(true);

    // Historique envoyé au modèle : tout sauf les erreurs, plus le nouveau message
    const history = [
      ...messages.filter((m) => !m.error).map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })),
      { role: "user", content: text },
    ];
    if (!messages.some((m) => m.from === "me")) onConversationStart?.();
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
          className="w-[70%] opacity-55 drop-shadow-[0_0_28px_rgba(255,255,255,0.14)]"
        />
      </div>

      <StatusBar time={clock?.time ?? null} className="relative" />

      {/* En-tête : contact + bouton d'extinction */}
      <header className="relative mt-3 flex items-center gap-2 border-b border-white/[0.08] bg-[#070b12]/40 px-3 pb-2.5 backdrop-blur-md">
        {/* Flèche retour + icône TwinsDev : retour à l'écran d'accueil (applications) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour à l'accueil"
          title="Retour à l'accueil"
          className="-ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-full py-0.5 pr-0.5 text-accent-strong transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={22} aria-hidden />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1a14] ring-1 ring-white/15">
            <Image src={CONTACT.avatar} alt="" width={480} height={244} sizes="24px" className="h-auto w-[22px]" />
            {/* Pastille « en ligne » sur l'avatar */}
            <span aria-hidden className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-[#0a1016]" />
          </span>
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-semibold">{CONTACT.name}</p>
          <p className="text-[11px] text-white/55" aria-live="polite">
            {typing ? <span className="text-accent-strong">écrit…</span> : "en ligne"}
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
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 [mask-image:linear-gradient(to_bottom,transparent,#000_22px)] [scrollbar-width:none]"
      >
        <ul className="mt-auto flex flex-col">
          {messages.length > 0 && (
            <li aria-hidden className="mx-auto mb-3 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-white/50 ring-1 ring-inset ring-white/[0.06]">
              Aujourd&apos;hui
            </li>
          )}
          {messages.map((m, i) => {
            const mine = m.from === "me";
            const prev = messages[i - 1];
            const next = messages[i + 1];
            // Messages consécutifs d'une même personne : regroupés (espacement serré, angles adaptés)
            const samePrev = !!prev && prev.from === m.from && !prev.error && !m.error;
            const sameNext = !!next && next.from === m.from && !next.error && !m.error;
            const read = mine && messages.slice(i + 1).some((x) => x.from === "them");
            return (
              <motion.li
                key={m.id}
                className={`flex items-end gap-1.5 ${mine ? "justify-end" : ""} ${samePrev ? "mt-0.5" : "mt-2.5 first:mt-0"}`}
                initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ transformOrigin: mine ? "bottom right" : "bottom left" }}
              >
                {!mine && <span className="w-6 shrink-0">{!sameNext && <Avatar />}</span>}
                <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  <p
                    className={`whitespace-pre-wrap break-words px-3 py-2 text-[13px] leading-snug ${
                      m.error
                        ? "rounded-[18px] rounded-bl-md border border-red-400/40 bg-[#3a151b]/95 text-red-100 backdrop-blur-md"
                        : mine
                          ? `rounded-[18px] rounded-br-md ${samePrev ? "rounded-tr-md" : ""} bg-[linear-gradient(160deg,#4ade80,#22c55e)] text-[#052e16] shadow-[0_6px_16px_-8px_rgba(34,197,94,0.7)]`
                          : `rounded-[18px] rounded-bl-md ${samePrev ? "rounded-tl-md" : ""} bg-[#1b2420]/95 text-white shadow-[0_4px_14px_-8px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/10 backdrop-blur-md`
                    }`}
                  >
                    <span className="sr-only">{mine ? "Vous : " : `${CONTACT.name} : `}</span>
                    {/* Le modèle met parfois du gras Markdown (**…**) : on n'affiche pas les astérisques */}
                    {mine ? m.text : m.text.replace(/\*\*|__/g, "")}
                  </p>
                  {/* Heure et accusé de lecture, sous le dernier message du groupe */}
                  {!sameNext && (
                    <span aria-hidden className="mt-1 flex items-center gap-1 px-1 text-[10px] tabular-nums text-white/40">
                      {m.at}
                      {mine &&
                        (read ? (
                          <CheckCheck size={12} strokeWidth={2.4} className="text-accent-strong" />
                        ) : (
                          <Check size={12} strokeWidth={2.4} />
                        ))}
                    </span>
                  )}
                </div>
              </motion.li>
            );
          })}
          {typing && (
            <motion.li
              key="typing"
              aria-label={`${CONTACT.name} est en train d'écrire`}
              className="mt-2.5 flex items-end gap-1.5"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="w-6 shrink-0">
                <Avatar />
              </span>
              <span className="rounded-[18px] rounded-bl-md bg-[#1b2420]/95 px-3.5 py-3 ring-1 ring-inset ring-white/10 backdrop-blur-md">
                <TypingDots />
              </span>
            </motion.li>
          )}
        </ul>
      </div>

      {/* Suggestions de réponse : jusqu'au premier message du visiteur */}
      <AnimatePresence>
        {ready && !messages.some((m) => m.from === "me") && (
          <motion.div
            role="group"
            aria-label="Suggestions de réponse"
            className="relative flex gap-1.5 overflow-x-auto px-3 pb-1 pt-1 [scrollbar-width:none]"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, transition: { duration: 0.15 } }}
          >
            {QUICK_REPLIES.map((q, i) => (
              <motion.button
                key={q.label}
                type="button"
                onClick={() => void send(undefined, q.message)}
                className="shrink-0 cursor-pointer rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-[11.5px] font-medium text-accent-strong transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : i * 0.06 }}
              >
                {q.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de saisie : champ avec bouton d'envoi intégré */}
      <form onSubmit={send} className="relative px-3 pb-7 pt-2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#121a17]/90 py-1 pl-3.5 pr-1 backdrop-blur-md transition-[border-color,box-shadow] duration-200 focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_INPUT))}
            onKeyDown={onKeyDown}
            placeholder={ready ? "Écris ton message…" : "TwinsDev écrit…"}
            disabled={!ready}
            aria-label="Votre message"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={MAX_INPUT}
            className="h-8 min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none disabled:text-white/40"
          />
          {draft.length >= COUNTER_FROM && (
            <span aria-live="polite" className={`shrink-0 font-mono text-[10px] tabular-nums ${draft.length >= MAX_INPUT ? "text-red-300" : "text-white/40"}`}>
              {draft.length}/{MAX_INPUT}
            </span>
          )}
          <button
            type="submit"
            disabled={!ready || busy || !draft.trim()}
            aria-label="Envoyer"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-[#052e16] shadow-[0_4px_12px_-4px_rgba(34,197,94,0.8)] transition-[background-color,color,box-shadow,transform] duration-200 active:scale-90 disabled:cursor-default disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SendHorizontal size={16} strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
