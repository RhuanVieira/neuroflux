import { useEffect, useState } from "react";
import "./css/app.css";
import { AuthModal } from "./components/auth/AuthModal";
import { LogoutConfirm } from "./components/auth/LogoutConfirm";
import { CrudFeedbackProvider } from "./components/feedback/CrudFeedback";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { StudyTips } from "./components/home/StudyTips";
import { SectionNavigator } from "./components/navigation/SectionNavigator";
import { GsapEffects } from "./components/effects/GsapEffects";
import { apiUrl, getUser, type User } from "./lib/api";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { HomePage } from "./pages/home/HomePage";
import { LibraryPage } from "./pages/library/LibraryPage";
function ApiError() { return <div className="api-error"><div><p className="eyebrow">ERRO DE SERVIÇO</p><h2>Servidor indisponível</h2><p>Não foi possível conectar ao servidor da Neuroflux.</p></div></div>; }
export default function App() { const [user, setUser] = useState<User | null>(getUser), [authMode, setAuthMode] = useState<"login" | "register" | null>(null), [confirmLogout, setConfirmLogout] = useState(false), [apiError, setApiError] = useState(false); const path = window.location.pathname; useEffect(() => { const params = new URLSearchParams(window.location.hash.slice(1)), oauthToken = params.get("oauth_token"), oauthUser = params.get("oauth_user"); if (oauthToken && oauthUser) { try { localStorage.setItem("neuroflux_token", oauthToken); localStorage.setItem("neuroflux_user", oauthUser); setUser(JSON.parse(oauthUser) as User); window.history.replaceState({}, "", "/materiais"); } catch { window.history.replaceState({}, "", "/"); } } }, []); useEffect(() => { fetch(`${apiUrl}/api/health`).then(response => setApiError(!response.ok)).catch(() => setApiError(true)); }, []); const logout = () => { setConfirmLogout(false); document.body.classList.add("is-leaving"); window.setTimeout(() => { localStorage.removeItem("neuroflux_token"); localStorage.removeItem("neuroflux_user"); setUser(null); window.location.assign("/"); }, 500); }; const openAuth = (mode: "login" | "register" = "login") => setAuthMode(mode); const page = path === "/materiais" ? <LibraryPage user={user} openAuth={openAuth} /> : path === "/calendario" ? <CalendarPage user={user} openAuth={openAuth} /> : path === "/painel" ? <DashboardPage user={user} openAuth={openAuth} /> : <HomePage user={user} openAuth={openAuth} />; return <CrudFeedbackProvider><GsapEffects /><div className="app"><Header user={user} openAuth={openAuth} logout={() => setConfirmLogout(true)} />{page}{path === "/" && <StudyTips />}<Footer />{path === "/" && <SectionNavigator />}{authMode && <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} onLogin={authenticatedUser => { setUser(authenticatedUser); setAuthMode(null); window.location.assign("/materiais"); }} />}{confirmLogout && <LogoutConfirm onCancel={() => setConfirmLogout(false)} onConfirm={logout} />}{apiError && <ApiError />}</div></CrudFeedbackProvider>; }
