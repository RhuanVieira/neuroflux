import { createContext, useContext, useState, type ReactNode } from "react";

type CrudFeedback = { track: <T,>(request: Promise<T>) => Promise<T> };
const CrudFeedbackContext = createContext<CrudFeedback | null>(null);

export function CrudFeedbackProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const track = <T,>(request: Promise<T>) => {
    const startedAt = Date.now();
    setActive(count => count + 1);
    void request.finally(() => {
      const remaining = Math.max(0, 3000 - (Date.now() - startedAt));
      window.setTimeout(() => setActive(count => Math.max(0, count - 1)), remaining);
    });
    return request;
  };
  return <CrudFeedbackContext.Provider value={{ track }}>{children}{active > 0 && <div className="crud-feedback" role="status" aria-live="polite"><span className="crud-spinner" aria-hidden="true" />Alterações sendo feitas…</div>}</CrudFeedbackContext.Provider>;
}

export function useCrudFeedback() {
  const context = useContext(CrudFeedbackContext);
  if (!context) throw new Error("useCrudFeedback deve ser usado dentro de CrudFeedbackProvider.");
  return context;
}
