import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envoi des demandes de contact par e-mail (SMTP). Configuration (.env.local) :
 *   SMTP_HOST   serveur SMTP (Gmail : smtp.gmail.com)
 *   SMTP_PORT   465 (SSL) ou 587 (STARTTLS)
 *   SMTP_USER   compte d'envoi (ex. twinsdev.next@gmail.com)
 *   SMTP_PASS   mot de passe d'application (Gmail : 16 caractères, pas le mot de passe du compte)
 *   CONTACT_TO  destinataire des demandes (par défaut : SMTP_USER)
 */

export type ContactRequest = { name: string; company: string; phone: string; email: string; type: string; message: string };

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: Transporter | null = null;
let transporterKey = "";

/** Transport SMTP, recréé si la configuration change (modification de .env.local sans redémarrage). */
function transport() {
  const port = Number(process.env.SMTP_PORT || 465);
  const key = [process.env.SMTP_HOST, port, process.env.SMTP_USER, process.env.SMTP_PASS].join("|");
  if (!transporter || key !== transporterKey) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
    transporterKey = key;
  }
  return transporter;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Pas de retour à la ligne dans un en-tête (sujet, nom affiché). */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** Envoie la demande à l'équipe ; « Répondre » répond directement au visiteur. */
export async function sendContactMail(req: ContactRequest) {
  const user = process.env.SMTP_USER!;
  const to = process.env.CONTACT_TO || user;
  const rows: [string, string][] = [
    ["Nom", req.name],
    ["E-mail", req.email],
    ["Téléphone", req.phone || "—"],
    ["Entreprise", req.company || "—"],
    ["Type de projet", req.type || "—"],
  ];

  const text = `${rows.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\nMessage :\n${req.message}\n`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a;line-height:1.5">
  <h2 style="margin:0 0 12px;font-size:18px">Nouvelle demande depuis le site TwinsDev</h2>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#64748b">${escape(k)}</td><td><strong>${escape(v)}</strong></td></tr>`)
    .join("")}</table>
  <p style="margin:16px 0 6px;color:#64748b">Message :</p>
  <div style="white-space:pre-wrap;padding:12px 14px;border-left:3px solid #22c55e;background:#f0fdf4">${escape(req.message)}</div>
  <p style="margin-top:16px;color:#64748b;font-size:13px">Répondez directement à cet e-mail pour écrire à ${escape(req.name)}.</p>
</div>`;

  await transport().sendMail({
    from: { name: "Site TwinsDev", address: user },
    to,
    replyTo: { name: oneLine(req.name), address: req.email },
    subject: oneLine(`Nouvelle demande : ${req.type || "projet"} — ${req.name}`).slice(0, 180),
    text,
    html,
  });
}
