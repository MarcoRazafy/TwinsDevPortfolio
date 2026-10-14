import type { ReactNode } from "react";

type Props = {
  /** Chemin affiché en petit, ex. « /services ». */
  path: string;
  /** Identifiant du titre (pour aria-labelledby de la section). */
  id: string;
  title: ReactNode;
  lede?: ReactNode;
};

/** En-tête commun des sections : chemin en mono, titre, phrase d'introduction. */
export default function SectionHead({ path, id, title, lede }: Props) {
  return (
    <div className="mb-12 flex max-w-[680px] flex-col gap-4 lg:mb-16">
      <p className="font-mono text-[13px] tracking-wide text-accent-strong">{path}</p>
      <h2
        id={id}
        className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
      >
        {title}
      </h2>
      {lede && <p className="max-w-[36em] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">{lede}</p>}
    </div>
  );
}
