import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, Truck, Sparkles } from "lucide-react";

const LIME = "#C5F24E";
const INK = "#10140a";

// Login aur Register ka shared layout: left brand panel + right form
function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Left: brand panel (sirf desktop) */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: INK, color: LIME }}
      >
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: LIME }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-lg font-black"
            style={{ background: LIME, color: INK }}
          >
            M
          </span>
          <span className="text-2xl font-black tracking-tight">Msee.</span>
        </Link>

        <div className="relative">
          <h2 className="text-5xl font-black leading-[0.95] tracking-tight">
            Shop smart.
            <br />
            Look{" "}
            <span
              className="inline-block -rotate-2 rounded-2xl px-3"
              style={{ background: LIME, color: INK }}
            >
              sharp.
            </span>
          </h2>
          <ul className="mt-8 space-y-3 text-sm font-semibold">
            {[
              { icon: Truck, text: "Free shipping on orders over $50" },
              { icon: ShieldCheck, text: "Secure account & payments" },
              { icon: Sparkles, text: "New drops every Friday" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs opacity-60">© {new Date().getFullYear()} Msee Store</p>
      </aside>

      {/* Right: form */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* mobile logo */}
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span
              className="grid h-9 w-9 place-items-center rounded-full font-black"
              style={{ background: INK, color: LIME }}
            >
              M
            </span>
            <span className="text-xl font-black">Msee.</span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-center text-sm text-neutral-600">{footer}</p>
        </motion.div>
      </section>
    </main>
  );
}

export default AuthShell;