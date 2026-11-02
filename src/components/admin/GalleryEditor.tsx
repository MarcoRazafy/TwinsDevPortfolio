"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Trash2, TriangleAlert, Upload } from "lucide-react";
import type { GalleryImage } from "@/lib/projects";
import { inputClass } from "./ui";

type Kept = GalleryImage & { id: number };
type Added = { id: number; file: File; preview: string };

const ACCEPTED = ["image/webp", "image/png", "image/jpeg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo par image, comme côté serveur

/**
 * Galerie d'un projet : images existantes (description modifiable, ordre, retrait) et nouvelles images,
 * sans limite de nombre. Plusieurs fichiers à la fois (sélection multiple ou glisser-déposer).
 * Champs envoyés : galleryKeep + galleryCaption (existantes, dans l'ordre), galleryNewCaption (nouvelles) ;
 * les fichiers des nouvelles images remontent au formulaire par `onNewFiles`, dans le même ordre.
 */
export default function GalleryEditor({ initial, onNewFiles }: { initial: GalleryImage[]; onNewFiles: (files: File[]) => void }) {
  const [kept, setKept] = useState<Kept[]>(() => initial.map((g, id) => ({ ...g, id })));
  const [added, setAdded] = useState<Added[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const nextId = useRef(initial.length);
  const picker = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());

  // Libère les aperçus à la fermeture de l'éditeur
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  useEffect(() => {
    onNewFiles(added.map((a) => a.file));
  }, [added, onNewFiles]);

  const addFiles = (list: FileList | null) => {
    const files = [...(list ?? [])];
    const ok = files.filter((f) => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE);
    setRejected(
      files
        .filter((f) => !ok.includes(f))
        .map((f) => `${f.name} (${ACCEPTED.includes(f.type) ? "plus de 5 Mo" : "format non pris en charge"})`),
    );
    const items = ok.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { id: nextId.current++, file, preview };
    });
    setAdded((all) => [...all, ...items]);
  };

  const removeAdded = (id: number) =>
    setAdded((all) => {
      const gone = all.find((a) => a.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        previews.current.delete(gone.preview);
      }
      return all.filter((a) => a.id !== id);
    });

  const swap = <T extends { id: number }>(all: T[], id: number, dir: -1 | 1) => {
    const i = all.findIndex((k) => k.id === id);
    const j = i + dir;
    if (j < 0 || j >= all.length) return all;
    const next = [...all];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const total = kept.length + added.length;

  return (
    <div
      className="flex flex-col gap-3"
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-white/75">Galerie</p>
        <p className="font-mono text-[11.5px] text-white/40">
          {total} image{total > 1 ? "s" : ""}
          {added.length > 0 && ` · ${added.length} à envoyer`}
        </p>
      </div>
      <p className="-mt-2 text-[12px] text-white/40">
        Captures et détails du projet, chacun avec sa description. Affichés sur l&apos;écran du projet, après le visuel.
      </p>

      {kept.map((g, i) => (
        <div key={g.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <input type="hidden" name="galleryKeep" value={g.src} />
          <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-lg bg-white/5">
            <Image src={g.src} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <textarea
            name="galleryCaption"
            defaultValue={g.caption}
            maxLength={300}
            rows={3}
            aria-label={`Description de l'image ${i + 1}`}
            placeholder="Description de l'image (facultatif)"
            className={`${inputClass} min-h-0 resize-none py-2 text-[13px]`}
          />
          <div className="flex shrink-0 flex-col">
            <SmallButton label={`Monter l'image ${i + 1}`} disabled={i === 0} onClick={() => setKept((all) => swap(all, g.id, -1))}>
              <ArrowUp size={14} aria-hidden />
            </SmallButton>
            <SmallButton label={`Descendre l'image ${i + 1}`} disabled={i === kept.length - 1} onClick={() => setKept((all) => swap(all, g.id, 1))}>
              <ArrowDown size={14} aria-hidden />
            </SmallButton>
            <SmallButton label={`Retirer l'image ${i + 1}`} danger onClick={() => setKept((all) => all.filter((k) => k.id !== g.id))}>
              <Trash2 size={14} aria-hidden />
            </SmallButton>
          </div>
        </div>
      ))}

      {added.map((a, i) => (
        <div key={a.id} className="flex gap-3 rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] p-2.5">
          <div className="flex w-28 shrink-0 flex-col gap-1">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-white/5">
              <Image src={a.preview} alt="" fill sizes="112px" unoptimized className="object-cover" />
            </div>
            <p className="truncate text-[10.5px] text-white/40" title={a.file.name}>
              {a.file.name}
            </p>
          </div>
          <textarea
            name="galleryNewCaption"
            maxLength={300}
            rows={3}
            aria-label={`Description de la nouvelle image ${i + 1}`}
            placeholder="Description de l'image (facultatif)"
            className={`${inputClass} min-h-0 resize-none py-2 text-[13px]`}
          />
          <div className="flex shrink-0 flex-col">
            <SmallButton label={`Monter la nouvelle image ${i + 1}`} disabled={i === 0} onClick={() => setAdded((all) => swap(all, a.id, -1))}>
              <ArrowUp size={14} aria-hidden />
            </SmallButton>
            <SmallButton
              label={`Descendre la nouvelle image ${i + 1}`}
              disabled={i === added.length - 1}
              onClick={() => setAdded((all) => swap(all, a.id, 1))}
            >
              <ArrowDown size={14} aria-hidden />
            </SmallButton>
            <SmallButton label={`Annuler la nouvelle image ${i + 1}`} danger onClick={() => removeAdded(a.id)}>
              <Trash2 size={14} aria-hidden />
            </SmallButton>
          </div>
        </div>
      ))}

      {/* Zone d'ajout : clic (sélection multiple) ou glisser-déposer */}
      <input
        ref={picker}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => picker.current?.click()}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragging ? "border-accent bg-accent/10 text-white" : "border-white/20 text-white/65 hover:border-white/40 hover:text-white"
        }`}
      >
        {dragging ? <Upload size={20} aria-hidden /> : <ImagePlus size={20} aria-hidden />}
        <span className="text-[13.5px] font-medium">{dragging ? "Déposez les images ici" : "Ajouter des images"}</span>
        <span className="text-[12px] text-white/40">Sélectionnez-en plusieurs d&apos;un coup, ou glissez-les ici · WebP, PNG, JPEG · 5 Mo max chacune</span>
      </button>

      {rejected.length > 0 && (
        <div role="alert" className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-[12.5px] text-amber-100/85">
          <TriangleAlert size={15} aria-hidden className="mt-0.5 shrink-0 text-amber-300" />
          <p>
            {rejected.length > 1 ? `${rejected.length} fichiers ignorés` : "Fichier ignoré"} : {rejected.join(", ")}.
          </p>
        </div>
      )}
    </div>
  );
}

function SmallButton({
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
      className={`grid h-8 w-8 place-items-center rounded-lg text-white/55 transition-colors disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        danger ? "hover:bg-red-500/15 hover:text-red-300" : "hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
