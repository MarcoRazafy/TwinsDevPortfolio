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
import { CONTENT_TAG, updateContent } from "@/lib/content/store";
import { deleteUpload, saveUpload } from "@/lib/content/uploads";
import {
  GALLERY_MAX,
  GALLERY_NEW_PER_SAVE,
  PROJECT_CATEGORIES,
  type GalleryImage,
  type Project,
  type ProjectCategory,
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

export async function saveProject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;

  const original = text(fd, "originalSlug", 60);
  const title = text(fd, "title", 120);
  const kind = text(fd, "kind", 80);
  const problem = text(fd, "problem", 400);
  const delivered = lines(fd, "delivered", 3, 120);
  const slug = text(fd, "slug", 60) || slugify(title);
  const categoryKeys = new Set(PROJECT_CATEGORIES.map((c) => c.key));
  const categories = [...new Set(fd.getAll("categories"))].filter((c): c is ProjectCategory =>
    categoryKeys.has(c as ProjectCategory),
  );
  const stack = techList(fd.getAll("stack"), 12);
  const site = text(fd, "site", 300);
  const code = text(fd, "code", 300);
  const accent = text(fd, "accent", 7);

  if (!title) return fail("Le titre est obligatoire.");
  if (!kind) return fail("Le secteur et le type de projet sont obligatoires.");
  if (!problem) return fail("La description est obligatoire.");
  if (!delivered.length) return fail("Indiquez au moins un point livré.");
  if (!categories.length) return fail("Choisissez au moins une catégorie.");
  if (!SLUG_OK.test(slug)) return fail("Identifiant invalide : lettres minuscules, chiffres et tirets.");
  if ((site && !URL_OK.test(site)) || (code && !URL_OK.test(code))) return fail("Lien invalide : il doit commencer par https://");

  // Galerie : images conservées (dans l'ordre affiché) + nouvelles images, chacune avec sa description
  const caption = (v: FormDataEntryValue | undefined) => (typeof v === "string" ? v.trim().slice(0, 300) : "");
  const keptSrc = fd.getAll("galleryKeep").filter((v): v is string => typeof v === "string");
  const keptCaptions = fd.getAll("galleryCaption");
  const newCaptions = fd.getAll("galleryNewCaption");
  const newEntries = fd
    .getAll("galleryFile")
    .map((f, i) => ({ file: f instanceof File && f.size > 0 ? f : null, caption: caption(newCaptions[i]) }))
    .filter((e): e is { file: File; caption: string } => e.file !== null);
  if (newEntries.length > GALLERY_NEW_PER_SAVE) {
    return fail(`${GALLERY_NEW_PER_SAVE} nouvelles images au maximum par enregistrement.`);
  }
  if (keptSrc.length + newEntries.length > GALLERY_MAX) return fail(`${GALLERY_MAX} images au maximum dans la galerie.`);

  // Envois : en cas d'échec, on supprime ce qui a déjà été enregistré
  const created: string[] = [];
  const cleanup = () => Promise.all(created.map((src) => deleteUpload(src)));
  const file = uploadedFile(fd, "image");
  let newImage: string | undefined;
  if (file) {
    const saved = await saveUpload(file, slug);
    if ("error" in saved) return fail(saved.error);
    newImage = saved.src;
    created.push(saved.src);
  }
  const added: GalleryImage[] = [];
  for (const entry of newEntries) {
    const saved = await saveUpload(entry.file, `${slug}-galerie`);
    if ("error" in saved) {
      await cleanup();
      return fail(saved.error);
    }
    created.push(saved.src);
    added.push({ src: saved.src, caption: entry.caption });
  }

  let replaced: string | undefined;
  let droppedGallery: string[] = [];
  let conflict = false;
  let missing = false;
  await updateContent((content) => {
    const index = original ? content.projects.findIndex((p) => p.slug === original) : -1;
    if (original && index < 0) {
      missing = true;
      return;
    }
    if (content.projects.some((p, i) => p.slug === slug && i !== index)) {
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

  if (missing || conflict) {
    await cleanup();
    return fail(missing ? "Ce projet n'existe plus : rechargez la page." : "Un autre projet utilise déjà cet identifiant.");
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

/** Déplace un projet dans la liste (l'ordre est celui de l'orbite autour du globe). */
export async function moveProject(slug: string, direction: -1 | 1): Promise<ActionState> {
  if (!(await getAdmin())) return SESSION_EXPIRED;
  await updateContent((content) => {
    const i = content.projects.findIndex((p) => p.slug === slug);
    const j = i + (direction === 1 ? 1 : -1);
    if (i < 0 || j < 0 || j >= content.projects.length) return;
    [content.projects[i], content.projects[j]] = [content.projects[j], content.projects[i]];
  });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Ordre mis à jour." };
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
