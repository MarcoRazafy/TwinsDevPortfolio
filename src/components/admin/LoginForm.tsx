"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { login, type ActionState } from "@/app/admin/actions";

type Props = {
  /** `compact` : version écran de téléphone. */
  compact?: boolean;
  /** Champ qui reçoit le focus à l'ouverture. */
  autoFocus?: boolean;
};

/** Formulaire de connexion administrateur (nom + mot de passe). En cas de succès, le serveur redirige vers /admin. */
export default function LoginForm({ compact = false, autoFocus = false }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  const [visible, setVisible] = useState(false);
  // Champ contrôlé : après un échec, React vide le formulaire, mais le nom saisi reste (seul le mot de passe est effacé)
  const [username, setUsername] = useState("");

  const field = `w-full rounded-xl border border-white/12 bg-white/[0.06] px-3.5 text-white placeholder:text-white/35 transition-colors focus:border-accent/70 focus:bg-white/[0.09] focus:outline-none ${
    compact ? "h-10 text-[13px]" : "h-11 text-[15px]"
  }`;
  const label = `mb-1.5 block font-medium text-white/70 ${compact ? "text-[11.5px]" : "text-[13px]"}`;

  return (
    <form action={action} className="flex flex-col gap-3.5" noValidate>
      <div>
        <label htmlFor={compact ? "phone-username" : "username"} className={label}>
          Nom
        </label>
        <input
          id={compact ? "phone-username" : "username"}
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus={autoFocus}
          className={field}
        />
      </div>
      <div>
        <label htmlFor={compact ? "phone-password" : "password"} className={label}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id={compact ? "phone-password" : "password"}
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${field} pr-11`}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {visible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
      </div>

      <p role="alert" aria-live="polite" className={`min-h-[1.25rem] text-red-300 ${compact ? "text-[11.5px]" : "text-[13px]"}`}>
        {state && !state.ok ? state.message : ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className={`flex items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-[#052e16] transition-[opacity,transform] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          compact ? "h-10 text-[13.5px]" : "h-11 text-[15px]"
        }`}
      >
        {pending ? <LoaderCircle size={17} className="animate-spin" aria-hidden /> : <LogIn size={17} aria-hidden />}
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
