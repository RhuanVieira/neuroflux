import { Role } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { tokenFor } from "../middlewares/auth.js";
import { publicUser } from "../utils/public-user.js";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3333/api/auth/google/callback";
const frontendUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
const google = clientId && clientSecret ? new OAuth2Client(clientId, clientSecret, redirectUri) : null;
const getCookie = (req, name) => req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1);
export function startGoogleLogin(_req, res) {
    if (!google)
        return res.status(503).json({ message: "O login Google ainda não foi configurado no servidor." });
    const state = crypto.randomBytes(32).toString("hex");
    res.cookie("neuroflux_google_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 10 * 60 * 1000, path: "/api/auth/google" });
    return res.redirect(google.generateAuthUrl({ access_type: "online", scope: ["openid", "email", "profile"], state, prompt: "select_account" }));
}
export async function completeGoogleLogin(req, res) {
    if (!google || !clientId)
        return res.status(503).send("O login Google ainda não foi configurado no servidor.");
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const expectedState = getCookie(req, "neuroflux_google_state");
    res.clearCookie("neuroflux_google_state", { path: "/api/auth/google" });
    if (!expectedState || !state || state.length !== expectedState.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState)))
        return res.status(400).send("A validação de segurança do login expirou. Tente novamente.");
    try {
        const code = typeof req.query.code === "string" ? req.query.code : "";
        const { tokens } = await google.getToken(code);
        if (!tokens.id_token)
            throw new Error("O Google não retornou um ID token.");
        const ticket = await google.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
        const profile = ticket.getPayload();
        if (!profile?.sub || !profile.email || !profile.email_verified)
            throw new Error("A conta Google não possui e-mail verificado.");
        const email = profile.email.toLowerCase();
        const existing = await prisma.user.findFirst({ where: { OR: [{ googleId: profile.sub }, { email }] } });
        if (existing?.role === Role.MASTER)
            return res.status(403).send("Contas MASTER devem usar o login normal.");
        if (existing?.googleId && existing.googleId !== profile.sub)
            return res.status(409).send("Este e-mail já está vinculado a outra conta Google.");
        const user = existing ? await prisma.user.update({ where: { id: existing.id }, data: { googleId: profile.sub, name: profile.name ?? existing.name, emailVerifiedAt: new Date() }, select: publicUser }) : await prisma.user.create({ data: { name: profile.name ?? email.split("@")[0], email, googleId: profile.sub, role: Role.STUDENT, passwordHash: "GOOGLE_EXTERNAL_ACCOUNT", emailVerifiedAt: new Date() }, select: publicUser });
        const handoff = new URLSearchParams({ oauth_token: tokenFor(user), oauth_user: JSON.stringify(user) });
        return res.redirect(`${frontendUrl}/#${handoff.toString()}`);
    }
    catch (error) {
        return res.status(401).send(error instanceof Error ? `Não foi possível concluir o login Google: ${error.message}` : "Não foi possível concluir o login Google.");
    }
}
