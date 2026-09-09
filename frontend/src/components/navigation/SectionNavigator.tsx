import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export function SectionNavigator() {
  const [atEnd, setAtEnd] = useState(false); const [moving, setMoving] = useState(false); const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { const checkPosition = () => setAtEnd(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24); checkPosition(); window.addEventListener("scroll", checkPosition, { passive: true }); window.addEventListener("resize", checkPosition); return () => { window.removeEventListener("scroll", checkPosition); window.removeEventListener("resize", checkPosition); }; }, []);
  function navigate() { if (moving) return; const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")]; const next = atEnd ? null : sections.find(section => section.getBoundingClientRect().top > 80); const destination = atEnd ? 0 : next ? Math.max(0, window.scrollY + next.getBoundingClientRect().top - 78) : document.documentElement.scrollHeight; setMoving(true); gsap.to(button.current, { scale: 1.18, duration: .16, yoyo: true, repeat: 1, ease: "power2.out" }); gsap.to(window, { scrollTo: { y: destination, autoKill: true }, duration: 1.15, ease: "power3.inOut", onComplete: () => setMoving(false), onInterrupt: () => setMoving(false) }); }
  return <motion.button ref={button} className={`section-navigator ${atEnd ? "is-up" : ""}${moving ? " is-moving" : ""}`} animate={{ scale: moving ? 1 : [1, 1.08, 1] }} transition={moving ? { duration: .2 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }} aria-label={atEnd ? "Voltar ao início" : "Ir para a próxima seção"} title={atEnd ? "Voltar ao início" : "Próxima seção"} onClick={navigate}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></motion.button>;
}
