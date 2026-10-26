"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, FolderKanban, LogOut, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { deleteProject, logout, moveProject, type ActionState } from "@/app/admin/actions";
import type { Content } from "@/lib/content/store";
import { PROJECT_CATEGORIES, type Project } from "@/lib/projects";
import ProfileEditor from "./ProfileEditor";
import ProjectEditor from "./ProjectEditor";
import { Status } from "./ui";

type Tab = "projets" | "profils";

/** Tableau de bord : projets (ajout, modification, ordre, suppression) et profils de la section « À propos ». */
export default function AdminDashboard({ username, content }: { username: string; content: Content }) {
  const [tab, setTab] = useState<Tab>("projets");

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-16 pt-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Image src="/brand/twinsdev-mark.webp" alt="" width={360} height={308} className="h-auto w-9" />
          <div className="leading-tight">
            <h1 className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold">Administration</h1>
            <p className="text-[12.5px] text-white/50">Connecté : {username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-[13.5px] text-white/75 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink size={15} aria-hidden />
            Voir le site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-[13.5px] text-white/75 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut size={15} aria-hidden />
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      <div role="tablist" aria-label="Sections" className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        {(
          [
            ["projets", "Projets", FolderKanban, content.projects.length],
            ["profils", "Profils", UserRound, content.team.length],
          ] as const
        ).map(([key, label, Icon, count]) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            onClick={() => setTab(key)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === key ? "bg-accent/15 text-white ring-1 ring-inset ring-accent/50" : "text-white/60 hover:text-white"
            }`}
          >
            <Icon size={16} aria-hidden />
            {label}
            <span className="rounded-full bg-white/10 px-1.5 font-mono text-[11px] text-white/70">{count}</span>
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "projets" ? <ProjectsPanel projects={content.projects} /> : <ProfilesPanel team={content.team} />}
      </section>
    </div>
  );
}

/* ── Projets ── */

function ProjectsPanel({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [status, setStatus] = useState<ActionState>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = editing && editing !== "new" ? (projects.find((p) => p.slug === editing) ?? null) : null;

  // La confirmation de suppression s'annule d'elle-même au bout de 4 s
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 4000);
    return () => clearTimeout(t);
  }, [confirm]);

  const run = (task: () => Promise<ActionState>) =>
    startTransition(async () => {
      setStatus(await task());
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-white/50">L&apos;ordre de la liste est celui de l&apos;orbite autour du globe.</p>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[13.5px] font-semibold text-[#052e16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c]"
          >
            <Plus size={16} aria-hidden />
            Nouveau projet
          </button>
        </div>
        <Status state={status} />
        <ul className="flex flex-col gap-2" aria-busy={pending}>
          {projects.map((p, i) => (
            <li
              key={p.slug}
              className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-colors ${
                editing === p.slug ? "border-accent/50 bg-accent/[0.06]" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {p.image && <Image src={p.image} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{p.title}</p>
                <p className="truncate text-[12px] text-white/45">
                  {p.categories.map((c) => PROJECT_CATEGORIES.find((x) => x.key === c)?.label).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <IconAction label={`Monter ${p.title}`} disabled={i === 0 || pending} onClick={() => run(() => moveProject(p.slug, -1))}>
                  <ArrowUp size={15} aria-hidden />
                </IconAction>
                <IconAction label={`Descendre ${p.title}`} disabled={i === projects.length - 1 || pending} onClick={() => run(() => moveProject(p.slug, 1))}>
                  <ArrowDown size={15} aria-hidden />
                </IconAction>
                <IconAction label={`Modifier ${p.title}`} onClick={() => setEditing(p.slug)}>
                  <Pencil size={15} aria-hidden />
                </IconAction>
                {confirm === p.slug ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        const r = await deleteProject(p.slug);
                        if (editing === p.slug) setEditing(null);
                        setConfirm(null);
                        return r;
                      })
                    }
                    className="ml-1 h-9 rounded-lg bg-red-500/90 px-2.5 text-[12.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Confirmer
                  </button>
                ) : (
                  <IconAction label={`Supprimer ${p.title}`} danger onClick={() => setConfirm(p.slug)}>
                    <Trash2 size={15} aria-hidden />
                  </IconAction>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        {editing ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <ProjectEditor
              key={editing}
              project={current}
              onClose={() => setEditing(null)}
              onSaved={(message) => {
                setEditing(null);
                setStatus({ ok: true, message });
              }}
            />
          </div>
        ) : (
          <div className="grid min-h-60 place-items-center rounded-3xl border border-dashed border-white/12 p-8 text-center text-[14px] text-white/45">
            Choisissez un projet à modifier, ou ajoutez-en un nouveau.
          </div>
        )}
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg text-white/55 transition-colors disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        danger ? "hover:bg-red-500/15 hover:text-red-300" : "hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Profils ── */

function ProfilesPanel({ team }: { team: Content["team"] }) {
  const [slug, setSlug] = useState(team[0]?.slug);
  const twin = team.find((t) => t.slug === slug) ?? team[0];
  if (!twin) return null;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Profil à modifier">
        {team.map((t) => (
          <button
            key={t.slug}
            type="button"
            aria-pressed={t.slug === twin.slug}
            onClick={() => setSlug(t.slug)}
            className={`inline-flex items-center gap-2.5 rounded-2xl border py-1.5 pl-1.5 pr-4 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              t.slug === twin.slug ? "border-accent/50 bg-accent/10 text-white" : "border-white/10 text-white/65 hover:text-white"
            }`}
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-xl" style={{ background: `${t.accent}33` }}>
              <Image src={t.image.src} alt="" fill sizes="36px" className="object-cover object-top" />
            </span>
            {t.name}
          </button>
        ))}
      </div>
      <div className="max-w-[860px]">
        <ProfileEditor key={twin.slug} twin={twin} />
      </div>
    </div>
  );
}
