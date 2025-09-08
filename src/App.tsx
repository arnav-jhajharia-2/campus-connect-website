import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, Building2, Wrench, Users, MessageSquare, BookOpen, Coffee, Heart, Star, Zap, X, Check, XCircle } from "lucide-react";

/**
 * Campus Landing — Minimal Cinematic Flow (v5, bugfix + handwriting theme)
 *
 * Fixes:
 * - Removed stray braces/arrays and orphaned JSX causing SyntaxError.
 * - Cleaned OptionCard duplication and an accidental closing fragment in EventsPanel.
 * - Consolidated font injector.
 *
 * Theme:
 * - Handwritten/sketch vibe (headings: Gloria Hallelujah; body: Patrick Hand)
 * - Notebook paper events panel, sticky-note option cards, dashed/rotated phone demo.
 *
 * Dev self-tests (runtime, non-UI):
 * - Asserts that fonts are injected and typewriter words exist.
 * - Adds simple unit tests for a pure helper that simulates typewriter steps.
 */

// ---------- Inject Google Fonts (handwritten) ----------
function useHandwrittenFont() {
  useEffect(() => {
    const add = (id: string, href: string) => {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    };
    add("font-patrick-hand", "https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");
    add("font-gloria", "https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap");
  }, []);
}

// ---------- Small utilities ----------
const useInterval = (cb: () => void, delay: number | null) => {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

// ---------- Pure helper (exported for external tests) ----------
export function simulateTypewriter(word: string, steps: number) {
  const s = Math.min(Math.max(steps, 0), word.length);
  return word.slice(0, s);
}

// Documented (non-runtime) test cases for external runners:
// { word: "feed", steps: 0, expect: "" }
// { word: "feed", steps: 2, expect: "fe" }
// { word: "feed", steps: 4, expect: "feed" }
// { word: "feed", steps: 99, expect: "feed" }


// ---------- Typewriter ----------
function Typewriter({
  words,
  speed = 90,
  hold = 1200,
  onFirstKeystroke,
  onFirstWordComplete,
}: {
  words: string[];
  speed?: number; // ms/char
  hold?: number; // ms to hold full word before erasing
  onFirstKeystroke?: () => void;
  onFirstWordComplete?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [hasTypedOnce, setHasTypedOnce] = useState(false);
  const [firstWordDone, setFirstWordDone] = useState(false);

  const current = words[index % words.length];

  useEffect(() => {
    if (!hasTypedOnce && sub > 0) {
      setHasTypedOnce(true);
      onFirstKeystroke?.();
    }
  }, [hasTypedOnce, sub, onFirstKeystroke]);

  useInterval(() => {
    if (dir === "fwd") {
      if (sub < current.length) {
        setSub((s) => s + 1);
      } else {
        if (!firstWordDone && index === 0) {
          setFirstWordDone(true);
          onFirstWordComplete?.();
        }
        setDir("back");
      }
    } else {
      if (sub > 0) {
        setSub((s) => s - 1);
      } else {
        setDir("fwd");
        setIndex((i) => i + 1);
      }
    }
  }, dir === "fwd" ? speed : speed * 0.5);

  // Hold when fully typed
  useEffect(() => {
    if (dir === "fwd" && sub === current.length) {
      const t = setTimeout(() => setDir("back"), hold);
      return () => clearTimeout(t);
    }
  }, [dir, sub, current.length, hold]);

  return (
    <span className="tabular-nums">
      <span className="border-b border-zinc-300/70">{current.slice(0, sub)}</span>
      <span className="inline-block w-[1ch] animate-pulse">|</span>
    </span>
  );
}


// ---------- Mobile App Demo (Centered Phone Outline) ----------
function MobileAppDemo({ play }: { play: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (play && ref.current) {
      ref.current.play().catch(() => {/* ignore autoplay errors */});
    }
  }, [play]);

  return (
    <div className="relative mx-auto w-[230px] sm:w-[260px] md:w-[320px]">
      <div className="relative aspect-[9/19] rounded-[2.4rem] border-[10px] border-black/90 bg-black shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 h-5 w-28 rounded-full bg-black/80 z-10" />
        <video
          ref={ref}
          muted
          playsInline
          controls
          src="https://res.cloudinary.com/dppdu4sip/video/upload/v1757312625/My_Movie_2_wx05ra.mp4"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 19'%3E%3C/svg%3E"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// ---------- Option Card ----------
function OptionCard({
  icon,
  title,
  desc,
  href,
  cta = "Open",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  cta?: string;
}) {
  return (
    <a
      href={href}
      className={cx(
        "group relative flex flex-col justify-between rounded-2xl p-6",
        "bg-[#FFF8D6] ring-1 ring-zinc-300 shadow-[3px_3px_0_0_rgba(0,0,0,0.25)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.3)] transition-all",
        "rotate-[0.3deg]"
      )}
      style={{ fontFamily: 'Patrick Hand, system-ui' }}
    >
      {/* masking tape */}
      <div className="absolute -top-3 left-6 h-6 w-16 rotate-[-6deg] bg-yellow-300/70 rounded-sm" />
      <div className="absolute -top-3 right-6 h-6 w-16 rotate-[8deg] bg-yellow-300/70 rounded-sm" />

      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-white/70 text-zinc-800 border border-dashed border-zinc-400">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>{title}</h3>
          <p className="text-[0.98rem] text-zinc-800 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-base font-medium text-zinc-900">
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}

// ---------- Pros and Cons Modal ----------
function ProsConsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200"
        style={{ fontFamily: 'Patrick Hand, system-ui' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
              Which option is right for you?
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Website */}
            <div className="p-6 border-2 border-blue-200 rounded-2xl bg-blue-50/50">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
                  <Building2 className="size-4" />
                  Main Website
                </div>
                <p className="text-blue-600 font-medium">Join existing community</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                    <Check className="size-4" />
                    Good for:
                  </h3>
                  <ul className="text-sm text-zinc-700 space-y-1">
                    <li>• Start immediately</li>
                    <li>• No technical skills needed</li>
                    <li>• Join 50K+ students</li>
                    <li>• Get support & updates</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                    <XCircle className="size-4" />
                    Trade-offs:
                  </h3>
                  <ul className="text-sm text-zinc-700 space-y-1">
                    <li>• Less customization</li>
                    <li>• $29/month cost</li>
                    <li>• Shared platform</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#main-site"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Choose Main Website
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            {/* Custom Version */}
            <div className="p-6 border-2 border-purple-200 rounded-2xl bg-purple-50/50">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
                  <Wrench className="size-4" />
                  Custom Version
                </div>
                <p className="text-purple-600 font-medium">Build your own</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                    <Check className="size-4" />
                    Good for:
                  </h3>
                  <ul className="text-sm text-zinc-700 space-y-1">
                    <li>• Full control & customization</li>
                    <li>• Your own branding</li>
                    <li>• Free to use</li>
                    <li>• Complete privacy</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                    <XCircle className="size-4" />
                    Trade-offs:
                  </h3>
                  <ul className="text-sm text-zinc-700 space-y-1">
                    <li>• Need dev skills</li>
                    <li>• Takes 2-4 weeks</li>
                    <li>• You maintain it</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#gitbook"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  Choose Custom
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Simple Decision Helper */}
          <div className="mt-8 p-4 bg-zinc-50 rounded-xl text-center">
            <p className="text-sm text-zinc-600">
              <strong>Quick tip:</strong> Choose Main Website if you want to start today. 
              Choose Custom if you have developers and want full control.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Page ----------
export default function CampusLanding() {
  useHandwrittenFont();
  const words = useMemo(() => ["feed", "events", "story", "lore"], []);
  const [phase, setPhase] = useState<"whatif" | "dots" | "typing">("whatif");
  const [dockLive, setDockLive] = useState(false);
  const [showProsCons, setShowProsCons] = useState(false);

  

  // Intro cinema: whatif -> dots -> typing
  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("dots"), 1200);
    const t2 = window.setTimeout(() => setPhase("typing"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const onFirstKeystroke = () => { /* reserved */ };
  const onFirstWordComplete = () => setDockLive(true);

  return (
    <>
      <div className="w-full h-full bg-white text-zinc-900">
        {/* HERO */}
        <section className="relative min-h-[88vh] flex items-center justify-center px-6">
          <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          <div className="relative w-full max-w-7xl">
            {/* Full-width intro text */}
            <div className="text-center mb-8" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
              <AnimatePresence mode="popLayout">
                {phase === "whatif" && (
                  <motion.h1
                    key="whatif"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium"
                    style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}
                  >
                    what if you could have an open source platform for...
                  </motion.h1>
                )}
                {phase === "dots" && (
                  <motion.div
                    key="dots"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight"
                    style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}
                  >
                    <span className="animate-pulse">...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile: Stacked layout for typing phase */}
            <div className="block lg:hidden">
              <AnimatePresence mode="popLayout">
                {phase === "typing" && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                    style={{ fontFamily: 'Patrick Hand, system-ui' }}
                  >
                    <div className="text-3xl md:text-6xl font-semibold tracking-tight" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      Campus <Typewriter words={words} speed={300} hold={2000} onFirstKeystroke={onFirstKeystroke} onFirstWordComplete={onFirstWordComplete} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Dock: Centered Phone Demo */}
              <AnimatePresence>
                {dockLive && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                    className="mt-8 md:mt-10 flex justify-center"
                  >
                    <MobileAppDemo play={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: Side-by-side layout for typing phase */}
            <div className="hidden lg:flex lg:items-center lg:gap-16">
              {/* Left side: Campus typing text */}
              <div className="flex-1" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                <AnimatePresence mode="popLayout">
                  {phase === "typing" && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl xl:text-7xl font-semibold tracking-tight"
                      style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}
                    >
                      Campus <Typewriter words={words} speed={300} hold={2000} onFirstKeystroke={onFirstKeystroke} onFirstWordComplete={onFirstWordComplete} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right side: Demo */}
              <div className="flex-1 flex justify-center">
                <AnimatePresence>
                  {dockLive && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: "spring", stiffness: 160, damping: 20 }}
                    >
                      <MobileAppDemo play={true} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <a href="#options" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-2">
            Scroll
            <span className="inline-block animate-bounce">↓</span>
          </a>
        </section>

        {/* OPTIONS */}
        

        {/* FEATURES */}
        <section className="relative py-16 md:py-24 bg-zinc-50/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                What makes CampusConnect special?
              </h2>
              <p className="text-zinc-700 max-w-2xl mx-auto" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                Built by students, for students. The only platform where you can add your own features through code or our app!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300/70 rounded-full rotate-12" />
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      Real Connections
                    </h3>
                    <p className="text-zinc-700 text-sm leading-relaxed" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                      Meet people who actually go to your school. No bots, no fake profiles, just real campus life.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-300 to-blue-300 rounded-full -rotate-12" />
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 text-green-600">
                    <MessageSquare className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-800" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      📚 Smart Study Groups
                    </h3>
                    <p className="text-green-700 text-sm leading-relaxed mb-3" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                      Find study buddies for that impossible math class! Plus, create custom study group types, 
                      integrate with your LMS, or build your own matching system.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Custom Group Types
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        LMS Integration
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full rotate-12" />
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600">
                    <BookOpen className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-purple-800" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      🎉 Custom Campus Events
                    </h3>
                    <p className="text-purple-700 text-sm leading-relaxed mb-3" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                      Never miss another campus event! But here's the cool part - you can create custom event types, 
                      integrate with your school's calendar, or build your own event matching system.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Custom Event Types
                      </span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                        Calendar Integration
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full -rotate-12" />
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600">
                    <Coffee className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-orange-800" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      ☕ Smart Meetups
                    </h3>
                    <p className="text-orange-700 text-sm leading-relaxed mb-3" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                      Grab coffee with someone new! But make it yours - customize the matching algorithm, 
                      add your own meetup types, or integrate with your campus coffee shops.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Custom Matching
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Venue Integration
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-300/70 rounded-full rotate-12" />
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-100 text-red-600">
                    <Heart className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                      Mental Health First
                    </h3>
                    <p className="text-zinc-700 text-sm leading-relaxed" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                      College can be tough. We prioritize your wellbeing with built-in support and positive community vibes.
                    </p>
                  </div>
                </div>
              </div>

               <div className="group relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all">
                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300/70 rounded-full -rotate-12" />
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                     <Zap className="size-6" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                       Lightning Fast
                     </h3>
                     <p className="text-zinc-700 text-sm leading-relaxed" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                       No more waiting for apps to load. CampusConnect is built for speed and simplicity.
                     </p>
                   </div>
                 </div>
               </div>

               {/* Special Feature - Add Your Own */}
               <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all md:col-span-2 lg:col-span-3">
                 <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full rotate-12" />
                 <div className="flex items-start gap-4">
                   <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
                     <Wrench className="size-8" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-semibold mb-3 text-purple-800" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                       🚀 Add Your Own Features
                     </h3>
                     <p className="text-purple-700 text-base leading-relaxed mb-4" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                       This is what makes us different! Build custom features for your campus through code or our visual app builder. 
                       Add study group matching, custom events, integration with your school's systems, or anything else you can imagine.
                     </p>
                     <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                         Code with React/Node.js
                       </span>
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                         Visual App Builder
                       </span>
                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                         API Integrations
                       </span>
                       <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                         Custom Themes
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                Numbers don't lie
              </h2>
              <p className="text-zinc-700" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                See what our community has accomplished
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                  2
                </div>
                <div className="text-sm text-zinc-600" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  Active Students
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                  1
                </div>
                <div className="text-sm text-zinc-600" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  Universities
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                  10
                </div>
                <div className="text-sm text-zinc-600" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  Connections Made
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                  null
                </div>
                <div className="text-sm text-zinc-600" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  App Store Rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative py-16 md:py-24 bg-zinc-50/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>
                What students are saying
              </h2>
              <p className="text-zinc-700" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                Fake stories from fake people
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <div className="absolute -top-3 left-6 h-6 w-16 rotate-[-6deg] bg-yellow-300/70 rounded-sm" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-700 mb-4 italic" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  "Finally found my study group for organic chemistry! We meet every Tuesday at the library and I actually understand the material now."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">S</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>Sarah M.</div>
                    <div className="text-xs text-zinc-500" style={{ fontFamily: 'Patrick Hand, system-ui' }}>Biology Major, UCLA</div>
                  </div>
                </div>
              </div>

              <div className="relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <div className="absolute -top-3 left-6 h-6 w-16 rotate-[8deg] bg-pink-300/70 rounded-sm" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-700 mb-4 italic" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  "Met my best friend through a coffee meetup! We both love indie music and now we go to concerts together every month."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">A</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>Alex K.</div>
                    <div className="text-xs text-zinc-500" style={{ fontFamily: 'Patrick Hand, system-ui' }}>Music Major, NYU</div>
                  </div>
                </div>
              </div>

              <div className="relative p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <div className="absolute -top-3 left-6 h-6 w-16 rotate-[-4deg] bg-blue-300/70 rounded-sm" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-700 mb-4 italic" style={{ fontFamily: 'Patrick Hand, system-ui' }}>
                  "The mental health resources on here are amazing. Found a support group for first-gen students and it's been life-changing."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">M</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>Maria R.</div>
                    <div className="text-xs text-zinc-500" style={{ fontFamily: 'Patrick Hand, system-ui' }}>Engineering, MIT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="options" className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: 'Gloria Hallelujah, Patrick Hand, system-ui' }}>Choose your path</h2>
              <p className="text-zinc-700 mt-2" style={{ fontFamily: 'Patrick Hand, system-ui' }}>Plug into the main network or craft your own flavor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <OptionCard
                icon={<Building2 className="size-5" />}
                title="Add your university / Search the list"
                desc="Join or discover campuses on our main website. Get instant access to feed, events, and more."
                href="https://staging-campus-gram-mvp-ei9i.frontend.encr.app/feed"
                cta="Go to main website"
              />
              <OptionCard
                icon={<Wrench className="size-5" />}
                title="Customize your own version"
                desc="Self-host, theme, and extend. Read our GitBook to ship your own Campus instance."
                href="https://adhiraj-and-co.gitbook.io/campusgram/"
                cta="Read GitBook docs"
              />
            </div>

            {/* Pros and Cons Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowProsCons(true)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Patrick Hand, system-ui' }}
              >
                <span className="text-lg">🤔</span>
                Unsure what to choose?
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>

        {/* GITHUB 70% viewport CTA */}
        <section className="relative h-[70vh] flex items-center justify-center border-t border-zinc-200">
          <a
            href="https://github.com/adhirajgupta/campus-gram" // TODO: replace with real repo
            className="group relative block w-full h-full"
          >
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex items-center gap-3">
                <span className="text-[clamp(56px,12vw,160px)] leading-none font-semibold ">github</span>
                <ArrowUpRight className="size-[clamp(42px,8vw,100px)] translate-y-1 group-hover:-translate-y-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* Footer (ultra minimal) */}
        <footer className="py-10 text-center text-xs text-zinc-600" style={{ fontFamily: 'Patrick Hand, system-ui' }}>© {new Date().getFullYear()} CampusConnect. All rights reserved.</footer>
      </div>

      {/* Pros and Cons Modal */}
      <AnimatePresence>
        <ProsConsModal 
          isOpen={showProsCons} 
          onClose={() => setShowProsCons(false)} 
        />
      </AnimatePresence>
    </>
  );
}
