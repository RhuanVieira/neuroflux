import { useState, type FormEvent } from "react";
import { apiUrl, canManage, token, type User } from "../../lib/api";
import { useCrudFeedback } from "../../components/feedback/CrudFeedback";
type Props = { user: User | null; openAuth: (mode?: "login" | "register") => void };
export function DashboardPage({ user, openAuth }: Props) { if (!user || !canManage(user)) return <main className="dashboard-page"><section className="access-card"><p className="eyebrow">ÁREA RESTRITA</p><h1>Este painel é para administradores.</h1><p>Masters e administradores podem criar e publicar atividades.</p><button className="button button-primary" onClick={() => openAuth("login")}>Entrar como administrador</button></section></main>; return <main className="dashboard-page"><section className="dashboard-header"><p className="eyebrow">PAINEL DO {user.role === "MASTER" ? "MASTER" : "ADMINISTRADOR"}</p><h1>Gestão de atividades</h1><p>Publique conteúdos para os alunos em poucos passos.</p></section><section className="activity-workspace"><aside><p className="eyebrow">PUBLICAÇÃO</p><h2>Uma boa atividade começa simples.</h2><ul><li>Use um título fácil de reconhecer.</li><li>Informe disciplina e série.</li><li>Envie um arquivo ou publique uma leitura.</li></ul></aside><ActivityForm /></section></main>; }
function ActivityForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { track } = useCrudFeedback();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    setLoading(true);
    setMessage("");
    try {
      let fileUrl: string | null = null;
      if (file instanceof File && file.size > 0) {
        const upload = new FormData();
        upload.append("file", file);
        const uploadResponse = await track(fetch(`${apiUrl}/api/materials/upload`, { method: "POST", headers: { Authorization: `Bearer ${token()}` }, body: upload }));
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.message ?? "Não foi possível enviar o arquivo.");
        fileUrl = uploadData.fileUrl;
      }
      const response = await track(fetch(`${apiUrl}/api/materials`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify({ title: form.get("title"), description: form.get("description"), subject: form.get("subject"), grade: Number(form.get("grade")), content: form.get("content") || null, fileUrl, status: "PUBLISHED" }) }));
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      formElement.reset();
      setMessage("Atividade publicada e disponível na biblioteca.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível publicar."); }
    finally { setLoading(false); }
  }

  return <form className="activity-form" onSubmit={submit}>
    <label>Título da atividade<input name="title" required minLength={3} /></label>
    <div className="form-row"><label>Disciplina<input name="subject" required minLength={2} /></label><label>Série<select name="grade"><option value="1">1º ano</option><option value="2">2º ano</option><option value="3">3º ano</option></select></label></div>
    <label>Descrição<textarea name="description" required minLength={3} /></label>
    <label>Orientações <span>(opcional)</span><textarea name="content" /></label>
    <label className="upload-label">Anexar arquivo <span>(opcional, até 20 MB)</span><input name="file" type="file" /></label>
    <button className="button button-primary" disabled={loading}>{loading ? "Publicando…" : "Publicar atividade"}</button>
    {message && <p className="form-message">{message}</p>}
  </form>;
}
