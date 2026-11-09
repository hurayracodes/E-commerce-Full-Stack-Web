import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

const LIME = "#C5F24E";
const INK = "#10140a";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900";

function Register() {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirm } = form;
    if (name.trim().length < 2) return setError("Naam kam az kam 2 harf ka ho.");
    if (!EMAIL_RE.test(email.trim())) return setError("Sahi email likhein.");
    if (password.length < 6) return setError("Password kam az kam 6 characters ka ho.");
    if (password !== confirm) return setError("Dono passwords match nahi karte.");

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // password strength: sirf ishara
  const strength = [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(form.password)).length;

  return (
    <AuthShell
      title="Create account"
      subtitle="Msee par shopping shuru karne ke liye register karein."
      footer={
        <>
          Pehle se account hai?{" "}
          <Link to="/login" className="font-extrabold text-neutral-900 underline underline-offset-4">
            Login karein
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
            placeholder="Full name"
            className={fieldClass}
          />
        </div>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className={fieldClass}
          />
        </div>

        <div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
              placeholder="Password (min 6 characters)"
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-900"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors"
                  style={{ background: i <= strength ? INK : "#e5e5e5" }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            name="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirm}
            onChange={onChange}
            placeholder="Confirm password"
            className={fieldClass}
          />
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-opacity disabled:opacity-60"
          style={{ background: INK, color: LIME }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;