import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export function LogoutConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const overlay = useRef<HTMLDivElement>(null); const dialog = useRef<HTMLElement>(null);
  useLayoutEffect(() => { const context = gsap.context(() => { gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: .22 }); gsap.fromTo(dialog.current, { opacity: 0, y: 22, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .38, ease: "back.out(1.5)" }); }); return () => context.revert(); }, []);
  return <div className="logout-overlay" ref={overlay} onMouseDown={onCancel}><section className="logout-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="logout-title" onMouseDown={event => event.stopPropagation()}><div className="logout-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10M12 8l4 4-4 4M16 12H8" /></svg></div><p className="eyebrow">ATÉ LOGO</p><h2 id="logout-title">Tem certeza que deseja sair?</h2><p>Sua sessão será encerrada, mas seus materiais e progresso continuarão aqui quando voltar.</p><div className="logout-actions"><button className="plain-button" onClick={onCancel}>Continuar estudando</button><button className="logout-confirm" onClick={onConfirm}>Sim, sair</button></div></section></div>;
}
