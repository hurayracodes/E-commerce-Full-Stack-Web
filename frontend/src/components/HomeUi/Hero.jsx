import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const SLIDES = [
  {
    title: ["Timeless Craft", "Meets Luxury"],
    desc: "Discover premium timepieces crafted with refined details, modern precision, and timeless sophistication for every occasion.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1400&auto=format&fit=crop",
    small: {
      image:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop",
      name: "Apex Chronograph Classic",
      tagline: "Precision. Style. Timeless design.",
    },
  },
  {
    title: ["Step Into", "Pure Comfort"],
    desc: "Explore the latest sneakers built for everyday performance, with bold colors, soft cushioning, and a look that stands out.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop",
    small: {
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop",
      name: "Velocity Runner Pro",
      tagline: "Lightweight. Bold. Built to move.",
    },
  },
];

const ease = [0.22, 1, 0.36, 1];

function Hero() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  // auto slide (resets whenever index changes)
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <section className="relative overflow-hidden bg-white text-neutral-900">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:px-10">
        {/* ---------- Left ---------- */}
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease }}
            >
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {slide.title[0]}
                <br />
                {slide.title[1]}
              </h1>
              <p className="mt-5 max-w-md text-sm text-neutral-500">{slide.desc}</p>
            </motion.div>
          </AnimatePresence>

          <Link to="/collection" className="mt-6 w-fit">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 rounded-full bg-neutral-900 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white"
            >
              View All Products
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-900">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </motion.span>
          </Link>

          {/* small product card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease, delay: 0.05 }}
              className="mt-10 w-full max-w-[260px]"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                <img
                  src={slide.small.image}
                  alt={slide.small.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-sm font-semibold">{slide.small.name}</p>
              <p className="text-xs text-neutral-500">{slide.small.tagline}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---------- Right ---------- */}
        <div className="relative">
          <div className="relative h-[340px] overflow-hidden rounded-[32px] bg-neutral-100 sm:h-[440px] lg:h-[520px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={slide.image}
                alt={slide.title.join(" ")}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* rotating SUMMER SALE badge (white ring creates the "cut" look) */}
          <Link
            to="/collection"
            className="absolute bottom-6 left-3 grid h-32 w-32 place-items-center rounded-full bg-white p-2 sm:h-36 sm:w-36 lg:-left-16 lg:bottom-24"
            aria-label="Shop now"
          >
            <motion.svg
              viewBox="0 0 120 120"
              className="absolute inset-0 h-full w-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, ease: "linear", repeat: Infinity }}
            >
              <defs>
                <path
                  id="sale-circle"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text fontSize="9" fontWeight="600" fill="#171717" letterSpacing="2">
                <textPath
                  href="#sale-circle"
                  textLength="285"
                  lengthAdjust="spacing"
                >
                  SUMMER SALE • SUMMER SALE • SUMMER SALE •
                </textPath>
              </text>
            </motion.svg>

            <motion.span
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-neutral-900 text-center text-white sm:h-20 sm:w-20"
            >
              <span className="flex flex-col items-center gap-0.5 text-[10px] font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Shop now
              </span>
            </motion.span>
          </Link>

          {/* slide indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-16 bg-red-500" : "w-8 bg-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;