"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  clearFailures,
  clientKey,
  createSession,
  destroySession,
  getAdmin,
  isAdminConfigured,
  lockedMinutes,
  recordFailure,
} from "@/lib/admin/auth";
import { CONTENT_TAG, getContent, updateContent } from "@/lib/content/store";
import { deleteUpload, MEDIA_PREFIX, saveUpload } from "@/lib/content/uploads";
import {
  CATEGORY_ICONS,
  CATEGORY_MAX,
  type CategoryIcon,
  type GalleryImage,
  type Project,
} from "@/lib/projects";
import type { SkillGroup, Twin } from "@/lib/team";
import { TESTIMONIAL_MAX, type Testimonial } from "@/lib/testimonials";
import { TECH, type TechKey } from "@/lib/tech";

/** Résultat renvoyé aux formulaires (useActionState). */
export type ActionState = { ok: boolean; message: string } | null;

const fail = (message: string): ActionState => ({ ok: false, message });
const SESSION_EXPIRED = fail("Session expirée : reconnectez-vous.");

/* ── Lecture et validation des champs ── */

const text = (fd: FormData, name: string, max: number) => {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};
const lines = (fd: FormData, name: string, maxItems: number, maxLength: number) =>
  fd
    .getAll(name)
    .map((v) => (typeof v === "string" ? v.trim().slice(0, maxLength) : ""))
    .filter(Boolean)
    .slice(0, maxItems);

const TECH_KEYS = new Set(Object.keys(TECH));
const techList = (values: unknown[], max: number) =>
  [...new Set(values.filter((v): v is TechKey => typeof v === "string" && TECH_KEYS.has(v)))].slice(0, max);

const URL_OK = /^(https?:\/\/[^\s]+|\/[^\s]*|#[\w-]*)$/;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COLOR_OK = /^#[0-9a-f]{6}$/i;
const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const uploadedFile = (fd: FormData, name: string) => {
  const f = fd.get(name);
  return f instanceof File && f.size > 0 ? f : null;
};

/* ── Connexion ── */

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isAdminConfigured()) {
    return fail("Espace admin non configuré : lancez « npm run admin:password » et renseignez .env.local.");
  }
  const key = await clientKey();
  const wait = lockedMinutes(key);
  if (wait) return fail(`Trop de tentatives. Réessayez dans ${wait} min.`);

  const username = text(fd, "username", 100);
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string).slice(0, 200) : "";
  if (!username || !password) return fail("Renseignez le nom et le mot de passe.");

  if (!(await checkCredentials(username, password))) {
    recordFailure(key);
    await new Promise((r) => setTimeout(r, 600)); // ralentit les essais en rafale
    return fail("Nom ou mot de passe incorrect.");
  }
  clearFailures(key);
  await createSession(username);
  redirect("/admin");
}

/** Une session admin est-elle ouverte ? (le cookie est httpOnly : seul le serveur peut le lire) */
export async function hasAdminSession(): Promise<boolean> {
  return (await getAdmin()) !== null;
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/* ── Projets ── */

/**
 * Envoie une image de galerie seule, avant l'enregistrement du projet : chaque envoi reste léger,
 * le nombre d'images n'est donc pas limité. Renvoie l'adresse à transmettre ensuite à saveProject.
 */
export async function uploadGalleryImage(fd: FormData): Promise<{ src: string } | { error: string }> {
  if (!(await getAdmin())) return { error: "Session expirée : reconnectez-vous." };
  const file = uploadedFile(fd, "file");
  if (!file) return { error: "Image vide." };
  const slug = slugify(text(fd, "slug", 60)) || "projet";
  return saveUpload(file, `${slug}-galerie`);
}

/** Supprime des images envoyées mais jamais enregistrées (envoi interrompu) ; celles d'un projet sont gardées. */
export async function discardGalleryUploads(srcs: string[]) {
  if (!(await getAdmin()) || !Array.isArray(srcs)) return;
  const { projects } = await getContent();
  const used = new Set(projects.flatMap((p) => [p.image, ...(p.gallery ?? []).map((g) => g.src)]));
  await Promise.all(srcs.filter((src) => typeof src === "string" && !used.has(src)).map((src) => deleteUpload(src)));
}

export async function saveProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;

  // Images de galerie déjà envoyées (uploadGalleryImage) : supprimées si l'enregistrement échoue
  const uploaded = fd
    .getAll("galleryUploaded")
    .filter((v): v is string => typeof v === "string" && v.startsWith(MEDIA_PREFIX));
  const discard = async (message: string) => {
    await Promise.all(uploaded.map((src) => deleteUpload(src)));
    return fail(message);
  };

  const original = text(fd, "originalSlug", 60);
  const title = text(fd, "title", 120);
  const kind = text(fd, "kind", 80);
  // Description sans limite pratique (garde-fou contre un collage accidentel de plusieurs Mo)
  const problem = text(fd, "problem", 200_000).replace(/\r\n?/g, "\n"); // retours à la ligne du navigateur (\r\n) normalisés
  const delivered = lines(fd, "delivered", 3, 120);
  const slug = text(fd, "slug", 60) || slugify(title);
  // Catégories cochées : vérifiées plus bas contre la liste enregistrée
  const requested = [...new Set(fd.getAll("categories"))].filter((c): c is string => typeof c === "string");
  const stack = techList(fd.getAll("stack"), 12);
  const site = text(fd, "site", 300);
  const code = text(fd, "code", 300);
  const accent = text(fd, "accent", 7);

  if (!title) return discard("Le titre est obligatoire.");
  if (!requested.length) return discard("Choisissez au moins une catégorie.");
  if (!SLUG_OK.test(slug)) return discard("Identifiant invalide : lettres minuscules, chiffres et tirets.");
  if ((site && !URL_OK.test(site)) || (code && !URL_OK.test(code))) return discard("Lien invalide : il doit commencer par https://");

  // Galerie : images conservées (dans l'ordre affiché) + nouvelles images déjà envoyées, chacune avec sa description
  const caption = (v: FormDataEntryValue | undefined) => (typeof v === "string" ? v.trim().slice(0, 300) : "");
  const keptSrc = fd.getAll("galleryKeep").filter((v): v is string => typeof v === "string");
  const keptCaptions = fd.getAll("galleryCaption");
  const newCaptions = fd.getAll("galleryNewCaption");
  const added: GalleryImage[] = uploaded.map((src, i) => ({ src, caption: caption(newCaptions[i]) }));

  // Visuel principal : en cas d'échec plus bas, il est supprimé avec les images de galerie
  const file = uploadedFile(fd, "image");
  let newImage: string | undefined;
  if (file) {
    const saved = await saveUpload(file, slug);
    if ("error" in saved) return discard(saved.error);
    newImage = saved.src;
  }
  const cleanup = () => Promise.all([...uploaded, newImage].map((src) => deleteUpload(src)));

  let replaced: string | undefined;
  let droppedGallery: string[] = [];
  let conflict = false;
  let missing = false;
  let noCategory = false;
  await updateContent((content) => {
    const index = original ? content.projects.findIndex((p) => p.slug === original) : -1;
    if (original && index < 0) {
      missing = true;
      return;
    }
    const categories = requested.filter((k) => content.categories.some((c) => c.key === k));
    if (!categories.length) {
      noCategory = true;
      return;
    }
    // Une nouvelle image ne doit appartenir à aucun projet (sinon la supprimer ici effacerait celle d'un autre)
    const used = new Set(content.projects.flatMap((p) => [p.image, ...(p.gallery ?? []).map((g) => g.src)]));
    if (content.projects.some((p, i) => p.slug === slug && i !== index) || uploaded.some((src) => used.has(src))) {
      conflict = true;
      return;
    }
    const previous = index >= 0 ? content.projects[index] : undefined;
    const removeImage = fd.get("removeImage") === "on";
    // Seules les images qui appartenaient déjà au projet peuvent être conservées (pas d'adresse arbitraire)
    const before = previous?.gallery ?? [];
    const kept = keptSrc
      .map((src, i) => ({ src, caption: caption(keptCaptions[i]) }))
      .filter((g, i, all) => before.some((b) => b.src === g.src) && all.findIndex((x) => x.src === g.src) === i);
    const gallery = [...kept, ...added];
    droppedGallery = before.filter((b) => !gallery.some((g) => g.src === b.src)).map((b) => b.src);
    const project: Project = {
      slug,
      categories,
      kind,
      title,
      problem,
      delivered,
      stack,
      links: { ...(site && { site }), ...(code && { code }) },
      accent: COLOR_OK.test(accent) ? accent : "#22c55e",
      image: newImage ?? (removeImage ? undefined : previous?.image),
      gallery: gallery.length ? gallery : undefined,
    };
    if (previous?.image !== project.image) replaced = previous?.image;
    if (index >= 0) content.projects[index] = project;
    else content.projects.push(project);
  });

  if (missing || conflict || noCategory) {
    await cleanup();
    return fail(
      missing
        ? "Ce projet n'existe plus : rechargez la page."
        : conflict
          ? "Un autre projet utilise déjà cet identifiant."
          : "Ces catégories n'existent plus : rechargez la page.",
    );
  }
  await Promise.all([deleteUpload(replaced), ...droppedGallery.map((src) => deleteUpload(src))]);
  updateTag(CONTENT_TAG);
  return { ok: true, message: original ? "Projet mis à jour." : "Projet ajouté." };
}

export async function deleteProject(slug: string): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  let images: (string | undefined)[] = [];
  await updateContent((content) => {
    const project = content.projects.find((p) => p.slug === slug);
    images = [project?.image, ...(project?.gallery ?? []).map((g) => g.src)];
    content.projects = content.projects.filter((p) => p.slug !== slug);
  });
  await Promise.all(images.map((src) => deleteUpload(src)));
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Projet supprimé." };
}

/**
 * Déplace un projet dans la liste (l'ordre est celui de l'orbite autour du globe). Avec `category`,
 * il échange sa place avec le projet voisin de la même catégorie (liste filtrée de l'administration).
 */
export async function moveProject(slug: string, direction: -1 | 1, category?: string): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  await updateContent((content) => {
    const list = content.projects;
    const i = list.findIndex((p) => p.slug === slug);
    if (i < 0) return;
    let j = i + direction;
    while (category && j >= 0 && j < list.length && !list[j].categories.includes(category)) j += direction;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Ordre mis à jour." };
}

/* ── Catégories ── */

const ICON_KEYS = new Set<string>(CATEGORY_ICONS);

/** Crée une catégorie, ou la renomme (champ `originalKey`) : sa clé ne change pas, les projets la gardent. */
export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  const original = text(fd, "originalKey", 40);
  const label = text(fd, "label", 24);
  const iconValue = text(fd, "icon", 20);
  const icon = (ICON_KEYS.has(iconValue) ? iconValue : "tag") as CategoryIcon;
  const key = original || slugify(label).slice(0, 40);
  if (!label || !key) return fail("Donnez un nom à la catégorie.");

  let error = "";
  await updateContent((content) => {
    const sameName = content.categories.find((c) => c.label.toLowerCase() === label.toLowerCase() && c.key !== original);
    if (sameName) {
      error = `La catégorie « ${sameName.label} » existe déjà.`;
      return;
    }
    if (original) {
      const category = content.categories.find((c) => c.key === original);
      if (!category) error = "Cette catégorie n'existe plus : rechargez la page.";
      else Object.assign(category, { label, icon });
      return;
    }
    if (content.categories.length >= CATEGORY_MAX) {
      error = `${CATEGORY_MAX} catégories au maximum : au-delà, les légendes se chevauchent sur le globe.`;
      return;
    }
    // Clé unique, même si le nom ressemble à celui d'une ancienne catégorie
    let unique = key;
    for (let n = 2; content.categories.some((c) => c.key === unique); n++) unique = `${key}-${n}`;
    content.categories.push({ key: unique, label, icon });
  });
  if (error) return fail(error);
  updateTag(CONTENT_TAG);
  return { ok: true, message: original ? "Catégorie modifiée." : `Catégorie « ${label} » créée.` };
}

/** Supprime une catégorie et la retire des projets ; refusé si un projet n'avait que celle-là. */
export async function deleteCategory(key: string): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  let error = "";
  await updateContent((content) => {
    const alone = content.projects.filter((p) => p.categories.length === 1 && p.categories[0] === key);
    if (alone.length) {
      const names = alone.slice(0, 2).map((p) => `« ${p.title.split(",")[0]} »`).join(", ");
      error = `${alone.length > 1 ? `${alone.length} projets n'ont` : "Un projet n'a"} que cette catégorie (${names}${alone.length > 2 ? "…" : ""}) : donnez-leur-en une autre d'abord.`;
      return;
    }
    content.categories = content.categories.filter((c) => c.key !== key);
    for (const p of content.projects) p.categories = p.categories.filter((c) => c !== key);
  });
  if (error) return fail(error);
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Catégorie supprimée." };
}

/* ── Profils ── */

function parseSkills(raw: string): SkillGroup[] | null {
  try {
    const data = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(data)) return null;
    // Pas de limite de nombre : seule borne, les technologies connues (sans doublon)
    return data
      .map((g) => ({
        label: typeof g?.label === "string" ? g.label.trim().slice(0, 40) : "",
        items: techList(Array.isArray(g?.items) ? g.items : [], TECH_KEYS.size),
      }))
      .filter((g) => g.label && g.items.length);
  } catch {
    return null;
  }
}

export async function saveProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;

  const slug = text(fd, "slug", 40);
  const name = text(fd, "name", 40);
  const role = text(fd, "role", 120);
  const tagline = text(fd, "tagline", 200);
  const bio = text(fd, "bio", 2400)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4);
  const does = lines(fd, "does", 3, 120);
  const stack = techList(fd.getAll("stack"), TECH_KEYS.size);
  const skills = parseSkills(text(fd, "skills", 20000));
  const linkedin = text(fd, "linkedin", 300);
  const github = text(fd, "github", 300);
  const email = text(fd, "email", 200);
  const accent = text(fd, "accent", 7);

  if (!name) return fail("Le prénom est obligatoire.");
  if (!role) return fail("Le rôle est obligatoire.");
  if (!tagline) return fail("La phrase d'accroche est obligatoire.");
  if (!bio.length) return fail("Le parcours est obligatoire.");
  if (!does.length) return fail("Indiquez au moins une chose qu'il fait sur un projet.");
  if (!skills) return fail("Compétences illisibles : rechargez la page.");
  if ((linkedin && !/^https:\/\//.test(linkedin)) || (github && !/^https:\/\//.test(github))) {
    return fail("Les liens LinkedIn et GitHub doivent commencer par https://");
  }
  if (email && !EMAIL_OK.test(email)) return fail("Adresse e-mail invalide.");

  const file = uploadedFile(fd, "image");
  let newImage: Twin["image"] | undefined;
  if (file) {
    const width = Number(fd.get("imageWidth"));
    const height = Number(fd.get("imageHeight"));
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 100 || height < 100 || width > 6000 || height > 6000) {
      return fail("Dimensions du portrait illisibles : choisissez à nouveau l'image.");
    }
    const saved = await saveUpload(file, `portrait-${slug}`);
    if ("error" in saved) return fail(saved.error);
    newImage = { src: saved.src, width, height };
  }

  let replaced: string | undefined;
  let missing = false;
  await updateContent((content) => {
    const index = content.team.findIndex((t) => t.slug === slug);
    if (index < 0) {
      missing = true;
      return;
    }
    const previous = content.team[index];
    content.team[index] = {
      ...previous,
      name,
      fullName: text(fd, "fullName", 120) || undefined,
      studies: text(fd, "studies", 120) || undefined,
      role,
      tagline,
      bio,
      does,
      stack,
      skills: skills.length ? skills : undefined,
      links: { ...(linkedin && { linkedin }), ...(github && { github }), ...(email && { email }) },
      accent: COLOR_OK.test(accent) ? accent : previous.accent,
      image: newImage ?? previous.image,
      example: false,
    };
    if (newImage) replaced = previous.image.src;
  });

  if (missing) {
    await deleteUpload(newImage?.src);
    return fail("Profil introuvable : rechargez la page.");
  }
  await deleteUpload(replaced);
  updateTag(CONTENT_TAG);
  return { ok: true, message: `Profil de ${name} mis à jour.` };
}

/* ── Avis clients ── */

export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;

  const original = text(fd, "originalId", 80);
  const company = text(fd, "company", 80);
  const quote = text(fd, "quote", 600);
  const author = text(fd, "author", 80);
  const role = text(fd, "role", 100);
  const website = text(fd, "website", 300);

  if (!company) return fail("Le nom de l'entreprise est obligatoire.");
  if (!quote) return fail("Le texte de l'avis est obligatoire.");
  if (!author) return fail("Le nom du responsable est obligatoire.");
  if (website && !/^https?:\/\/[^\s]+$/.test(website)) return fail("Le site doit commencer par https://");

  const file = uploadedFile(fd, "logo");
  let newLogo: string | undefined;
  if (file) {
    const saved = await saveUpload(file, `logo-${slugify(company) || "entreprise"}`);
    if ("error" in saved) return fail(saved.error);
    newLogo = saved.src;
  }

  let replaced: string | undefined;
  let missing = false;
  let full = false;
  await updateContent((content) => {
    const index = original ? content.testimonials.findIndex((t) => t.id === original) : -1;
    if (original && index < 0) {
      missing = true;
      return;
    }
    if (index < 0 && content.testimonials.length >= TESTIMONIAL_MAX) {
      full = true;
      return;
    }
    const previous = index >= 0 ? content.testimonials[index] : undefined;
    const logo = newLogo ?? (fd.get("removeImage") === "on" ? undefined : previous?.logo);
    if (previous?.logo !== logo) replaced = previous?.logo;
    const testimonial: Testimonial = {
      id: previous?.id ?? `${slugify(company) || "avis"}-${Date.now().toString(36)}`,
      company,
      logo,
      website: website || undefined,
      quote,
      author,
      role,
    };
    if (index >= 0) content.testimonials[index] = testimonial;
    else content.testimonials.push(testimonial);
  });

  if (missing || full) {
    await deleteUpload(newLogo);
    return fail(missing ? "Cet avis n'existe plus : rechargez la page." : `${TESTIMONIAL_MAX} avis au maximum.`);
  }
  await deleteUpload(replaced);
  updateTag(CONTENT_TAG);
  return { ok: true, message: original ? "Avis mis à jour." : "Avis ajouté." };
}

export async function deleteTestimonial(id: string): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  let logo: string | undefined;
  await updateContent((content) => {
    logo = content.testimonials.find((t) => t.id === id)?.logo;
    content.testimonials = content.testimonials.filter((t) => t.id !== id);
  });
  await deleteUpload(logo);
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Avis supprimé." };
}

/** Déplace un avis (l'ordre est celui de l'affichage sur le site). */
export async function moveTestimonial(id: string, direction: -1 | 1): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  await updateContent((content) => {
    const i = content.testimonials.findIndex((t) => t.id === id);
    const j = i + (direction === 1 ? 1 : -1);
    if (i < 0 || j < 0 || j >= content.testimonials.length) return;
    [content.testimonials[i], content.testimonials[j]] = [content.testimonials[j], content.testimonials[i]];
  });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Ordre mis à jour." };
}
