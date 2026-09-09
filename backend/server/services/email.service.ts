import nodemailer from "nodemailer";

export class EmailConfigurationError extends Error {}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? user;

export async function sendVerificationCode(email: string, code: string) {
  if (!host || !user || !pass || !from) throw new EmailConfigurationError("O envio de e-mail ainda não foi configurado. Preencha SMTP_HOST, SMTP_USER, SMTP_PASS e SMTP_FROM.");
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({ from, to: email, subject: "Código de confirmação — Neuroflux", text: `Seu código de confirmação é: ${code}. Ele expira em 10 minutos.`, html: `<p>Seu código de confirmação é:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>Ele expira em 10 minutos.</p>` });
}
