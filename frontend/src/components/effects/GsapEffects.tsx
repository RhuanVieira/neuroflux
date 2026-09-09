import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function GsapEffects() {
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const cleanupListeners: Array<() => void> = [];
    const context = gsap.context(() => {
      gsap.from(".navbar", { y: -36, opacity: 0, duration: .7, ease: "power3.out" });
      gsap.from(".hero-copy > *", { y: 28, opacity: 0, duration: .75, stagger: .11, delay: .15, ease: "power3.out" });
      gsap.from(".hero-visual", { x: 38, opacity: 0, duration: .9, delay: .25, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => gsap.from(element, { y: 35, opacity: 0, duration: .7, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 87%", once: true } }));
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach(group => gsap.from(group.children, { y: 26, opacity: 0, duration: .55, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: group, start: "top 88%", once: true } }));
      gsap.utils.toArray<HTMLElement>("main .button, main .file-button, main .download-button, main .card-link, main .quick-path-actions a, main .text-link").forEach(button => {
        gsap.from(button, { y: 16, opacity: 0, duration: .45, ease: "power2.out", scrollTrigger: { trigger: button, start: "top 93%", once: true } });
        const enter = () => gsap.to(button, { y: -3, duration: .2, ease: "power2.out", overwrite: "auto" });
        const leave = () => gsap.to(button, { y: 0, duration: .25, ease: "power2.out", overwrite: "auto" });
        button.addEventListener("mouseenter", enter); button.addEventListener("mouseleave", leave);
        cleanupListeners.push(() => { button.removeEventListener("mouseenter", enter); button.removeEventListener("mouseleave", leave); });
      });
    });
    return () => { cleanupListeners.forEach(cleanup => cleanup()); context.revert(); };
  }, []);
  return null;
}
