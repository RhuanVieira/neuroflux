export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export type Role = "MASTER" | "ADMIN" | "STUDENT";
export type User = { name: string; role: Role };
export type Material = { id: number; title: string; description: string; subject: string; grade: number | null; content: string | null; fileUrl: string | null; author: { name: string } };
export type EventType = "EVENT" | "ENTRANCE_EXAM" | "OLYMPIAD";
export type CalendarEvent = { id: number; title: string; description: string; type: EventType; startsAt: string; endsAt: string | null; location: string | null; link: string | null; author: { name: string } };
export const token = () => localStorage.getItem("neuroflux_token");
export const getUser = (): User | null => { try { return JSON.parse(localStorage.getItem("neuroflux_user") ?? "null") as User | null; } catch { return null; } };
export const canManage = (user: User | null) => user?.role === "ADMIN" || user?.role === "MASTER";
