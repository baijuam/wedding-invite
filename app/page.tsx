"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type RsvpMode = "yes" | "no" | null;

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

// ── Feiera platform integration metadata ──────────────────
// Consumed by the Feiera event engine when this invite is
// embedded as an event. All values are intentionally const
// so they can be tree-shaken out of a static export.
const EVENT_META = {
  product: "Feiera",
  parentBrand: "Neuverk",
  eventSlug: "amal-athira",
  eventType: "wedding",
  eventTitle: "Amal & Athira",
  publicUrl: "https://amal-athira.feiera.com",
} as const;

const SCHEDULE = [
  {
    time: "22 AUG · 3:00 PM",
    title: "Bride House Gathering",
    desc: "A warm pre-wedding gathering with family, laughter and blessings at the bride's home.",
  },
  {
    time: "23 AUG · 10:30 AM",
    title: "Guest Arrival",
    desc: "Guests are received at Sivagiri Mutt and warmly welcomed by both families.",
  },
  {
    time: "23 AUG · 11:05 AM",
    title: "Sweekaranam",
    desc: "The auspicious wedding ceremony begins. 11:05 AM to 11:55 AM.",
  },
  {
    time: "After Ceremony",
    title: "Sadya & Reception",
    desc: "Traditional Kerala sadya, photographs and celebration with loved ones.",
  },
];

export default function WeddingInvitation() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [showPreparing, setShowPreparing] = useState(false);
  const preparingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleOpen() {
    if (opening || opened) return;
    setOpening(true);
    setOpened(true);
    // Safety net: show "Preparing…" only if animation takes > 1s (e.g. slow devices)
    preparingTimerRef.current = setTimeout(() => setShowPreparing(true), 1000);
  }

  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [rsvpMode, setRsvpMode] = useState<RsvpMode>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpDuplicate, setRsvpDuplicate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    guests: "1",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const target = new Date("2026-08-23T11:05:00+05:30").getTime();

    const tick = () => {
      const distance = target - Date.now();

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance / 3600000) % 24),
        minutes: Math.floor((distance / 60000) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function submitRsvp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!rsvpMode) {
      alert("Please select Yes or No.");
      return;
    }

    // Client-side validation
    if (rsvpMode === "yes") {
      if (!form.name.trim() || !form.email.trim()) {
        alert("Please enter your name and email address.");
        return;
      }
    } else {
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        alert("Please enter your name, email address, and wishes message.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          attending: rsvpMode === "yes",
          guest_count: rsvpMode === "yes" ? Number(form.guests || 1) : 0,
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      });

      let data: { success?: boolean; duplicate?: boolean; error?: string };
      try {
        data = await res.json();
      } catch {
        data = { success: false, error: "Server returned an invalid response." };
      }
      console.log("RSVP response:", data);

      if (data.success && data.duplicate) {
        setRsvpDuplicate(true);
        setSubmitted(true);
        return;
      }

      if (!res.ok || !data.success) {
        console.error("RSVP failed:", data);
        alert(data.error || "Something went wrong. Please try again.");
        return;
      }

      setRsvpDuplicate(false);
      setSubmitted(true);
    } catch (error) {
      console.error("RSVP error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative overflow-x-hidden">
      {/* Back button — fades in only when invitation is open */}
      <AnimatePresence>
        {opened && (
          <motion.button
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => { setOpened(false); setOpening(false); setShowPreparing(false); }}
            className="fixed left-4 top-4 z-50 font-caption text-[9px] uppercase tracking-[0.35em] text-white/45 transition-colors duration-200 hover:text-white/80"
          >
            ← back to card
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fallback overlay — only shows on very slow devices if animation > 1s */}
      <AnimatePresence>
        {showPreparing && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          >
            <p className="font-caption text-[10px] uppercase tracking-[0.36em] text-[#6f843f]">
              Preparing your invitation…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mode="popLayout" lets exit + entry run in parallel (exit element leaves layout instantly) */}
      <AnimatePresence mode="popLayout">
        {!opened ? (
          <OpeningInvite
            key="opening"
            countdown={countdown}
            onOpen={handleOpen}
            opening={opening}
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => {
              // Content is fully visible — dismiss the fallback overlay
              if (preparingTimerRef.current) clearTimeout(preparingTimerRef.current);
              setShowPreparing(false);
            }}
          >
            <div className="paper-green relative z-10 min-h-screen text-[#fffaf0]">
              <GreenInvitation />
              <ScheduleSection />
              <RsvpSection
                rsvpMode={rsvpMode}
                setRsvpMode={setRsvpMode}
                submitted={submitted}
                submitting={submitting}
                rsvpDuplicate={rsvpDuplicate}
                form={form}
                setForm={setForm}
                submitRsvp={submitRsvp}
              />
              <FooterSection />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   OPENING SCREEN — luxury split-hero layout
═══════════════════════════════════════════════════════════ */

function OpeningInvite({
  countdown,
  onOpen,
  opening,
}: {
  countdown: Countdown;
  onOpen: () => void;
  opening: boolean;
}) {
  return (
    <motion.section
      className="paper-cream relative flex min-h-svh items-center overflow-x-hidden lg:h-screen lg:overflow-hidden"
      exit={{ opacity: 0, scale: 1.06, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeIn" }}
    >
      {/* Deep parchment vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_200px_rgba(100,80,40,0.2)]" />

      {/* Full-screen temple watermark — engraved artwork feel */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/temple.png"
          alt=""
          aria-hidden="true"
          className="h-[52%] w-auto object-contain mix-blend-multiply sm:h-[68%]"
          style={{ opacity: 0.04 }}
        />
      </div>

      {/* Corner botanical ornaments */}
      <BotanicalCorner className="absolute left-0 top-0" />
      <BotanicalCorner className="absolute bottom-0 right-0 rotate-180" />

      {/* Floating side leaves — hidden on small screens to keep text clear */}
      <div className="hidden sm:block">
        <FloatingLeaves />
      </div>

      {/* ── Main layout: left text | right card ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-12 lg:py-0">

        {/* LEFT — invitation hero text */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

          {/* "You're Invited" label */}
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#b59b5b]/55" />
            <p className="font-caption text-[9px] uppercase tracking-[0.5em] text-[#b59b5b]">
              You&apos;re Invited
            </p>
            <span className="h-px w-8 bg-[#b59b5b]/55" />
          </div>

          {/* Headline */}
          <div className="font-display leading-[1.1] text-[#4d6135]">
            <p className="text-[clamp(1.9rem,5.2vw,4.2rem)]">Two hearts.</p>
            <p className="text-[clamp(1.9rem,5.2vw,4.2rem)]">One promise.</p>
            <p className="text-[clamp(1.9rem,5.2vw,4.2rem)] italic text-[#6f843f]">
              A lifetime together.
            </p>
          </div>

          {/* Gold ornament divider */}
          <div className="my-3 flex items-center gap-2.5">
            <span className="h-px w-10 bg-[#b59b5b]/35" />
            <span className="text-[10px] text-[#b59b5b]/70">✦</span>
            <span className="h-px w-10 bg-[#b59b5b]/35" />
          </div>

          {/* Names */}
          <div className="font-display text-[#4d6135]">
            <p className="text-[clamp(1rem,2.2vw,1.55rem)] uppercase tracking-[0.26em]">
              AMAL BAIJU
            </p>
            <p className="my-1 text-xl italic text-[#8a9b61]">&amp;</p>
            <p className="text-[clamp(0.95rem,2vw,1.45rem)] uppercase tracking-[0.22em]">
              ATHIRA SUSEELAN
            </p>
          </div>

          {/* Date */}
          <p className="mt-3 font-caption text-[9px] uppercase tracking-[0.3em] text-[#6f843f]/72">
            23 August 2026 · 11:05 AM · Sivagiri Mutt, Varkala
          </p>

          {/* Countdown */}
          <div className="mt-4 grid w-full max-w-60 grid-cols-4 gap-1.5">
            <CountdownBox value={countdown.days} label="Days" />
            <CountdownBox value={countdown.hours} label="Hrs" />
            <CountdownBox value={countdown.minutes} label="Min" />
            <CountdownBox value={countdown.seconds} label="Sec" />
          </div>

          {/* CTA */}
          <div className="mt-5 flex flex-col items-center gap-2.5 lg:items-start">
            <motion.button
              onClick={onOpen}
              disabled={opening}
              whileHover={opening ? {} : { scale: 1.02, backgroundColor: "#3d4f28" }}
              whileTap={opening ? {} : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="relative bg-[#4d6135] px-10 py-3.5 font-caption text-[9px] uppercase tracking-[0.36em] text-[#f8f5ec] shadow-[0_4px_20px_rgba(77,97,53,0.25)] disabled:cursor-default disabled:opacity-80"
            >
              {opening ? (
                <span className="flex items-center gap-2.5">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#f8f5ec]/70" />
                  Opening…
                </span>
              ) : (
                "Open Invitation"
              )}
            </motion.button>
            <button
              onClick={onOpen}
              disabled={opening}
              className="font-caption text-[8px] uppercase tracking-[0.28em] text-[#6f843f]/50 transition-colors hover:text-[#6f843f]/80 disabled:pointer-events-none"
            >
              view details →
            </button>
          </div>
        </div>

        {/* RIGHT — invitation preview card */}
        <div className="flex justify-center lg:justify-end">
          <InvitationCard onOpen={onOpen} opening={opening} />
        </div>
      </div>
    </motion.section>
  );
}

/* Floating invitation card — tap to open */
function InvitationCard({ onOpen, opening }: { onOpen: () => void; opening: boolean }) {
  return (
    /* Entry animation + hover tilt */
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      whileHover={opening ? {} : { rotate: 1.5 }}
      className="relative"
    >
      {/* Back envelope layer — peeking behind the card */}
      <div className="pointer-events-none absolute inset-0 translate-x-4 translate-y-3 rotate-[5deg] rounded-3xl border border-[#8a9b61]/20 bg-[#dfe7d2]/60" />

      {/* Floating button */}
      <motion.button
        onClick={onOpen}
        disabled={opening}
        animate={opening ? {} : { y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
        whileTap={opening ? {} : { scale: 0.97 }}
        aria-label="Tap to open invitation"
        className="relative w-[min(86vw,360px)] cursor-pointer rounded-3xl border border-[#b59b5b]/45 bg-[#fffdf6]/90 px-5 py-6 text-center shadow-2xl outline-none disabled:cursor-default sm:w-[min(88vw,420px)] sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      >
        {/* Thin inner border */}
        <div className="pointer-events-none absolute inset-1.5 rounded-2xl border border-[#b59b5b]/16" />

        {/* Temple watermark inside card */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden rounded-3xl">
          <img
            src="/temple.png"
            alt=""
            aria-hidden="true"
            className="w-[90%] mix-blend-multiply"
            style={{ opacity: 0.042 }}
          />
        </div>

        {/* Content — lifts on hover */}
        <motion.div className="relative z-10" whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
          {/* Script names */}
          <p className="font-script text-[clamp(2.25rem,12vw,3.5rem)] leading-none text-[#4d6135]">Amal</p>
          <p className="my-2 font-display text-[clamp(1rem,3vw,1.2rem)] italic text-[#b59b5b]">&amp;</p>
          <p className="font-script text-[clamp(2.25rem,12vw,3.5rem)] leading-none text-[#4d6135]">Athira</p>

          {/* Gold rule */}
          <div className="mx-auto mt-4 mb-4 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-[#b59b5b]/30" />
            <span className="text-[8px] text-[#b59b5b]/60">✦</span>
            <span className="h-px flex-1 bg-[#b59b5b]/30" />
          </div>

          <p className="font-display text-[11px] italic leading-5 text-[#6f843f]/70">
            Together with their families
          </p>

          {/* Divider */}
          <div className="mx-auto my-4 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-[#b59b5b]/30" />
            <span className="text-[8px] text-[#b59b5b]/60">✦</span>
            <span className="h-px flex-1 bg-[#b59b5b]/30" />
          </div>

          {/* Date */}
          <p className="font-display text-[2rem] leading-none text-[#4d6135]">23</p>
          <p className="mt-0.5 font-caption text-[7px] uppercase tracking-[0.36em] text-[#6f843f]">
            August 2026
          </p>
          <p className="mt-3 font-caption text-[7px] uppercase tracking-[0.3em] text-[#8a9b61]">
            11:05 AM
          </p>

          {/* Thin rule */}
          <div className="mx-auto mt-4 h-px w-10 bg-[#b59b5b]/28" />

          {/* Venue */}
          <p className="mt-3.5 font-display text-[0.95rem] italic text-[#4d6135]">
            Sivagiri Mutt
          </p>
          <p className="mt-0.5 font-caption text-[7px] uppercase tracking-[0.22em] text-[#8a9b61]/72">
            Sivagiri Rd, Varkala
          </p>

          <p className="mt-5 font-display text-[10px] italic text-[#b59b5b]/60">
            {opening ? "opening…" : "tap to open ↓"}
          </p>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

/* ── Botanical decorations ─────────────────────────────── */

function BotanicalCorner({ className }: { className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none ${className ?? ""}`}
      animate={{ opacity: [0.26, 0.36, 0.26] }}
      transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
    >
      <svg width="170" height="170" viewBox="0 0 170 170" fill="none">
        {/* Main diagonal stem */}
        <path d="M 14 14 Q 52 62 85 85 Q 118 108 148 148" stroke="#6f843f" strokeWidth="0.9" />
        {/* Branch 1 */}
        <path d="M 38 38 Q 58 24 76 14" stroke="#6f843f" strokeWidth="0.65" />
        <ellipse cx="69" cy="17" rx="9" ry="3.2" transform="rotate(-36 69 17)" stroke="#6f843f" strokeWidth="0.55" />
        {/* Branch 2 */}
        <path d="M 62 62 Q 80 46 94 32" stroke="#6f843f" strokeWidth="0.62" />
        <ellipse cx="90" cy="35" rx="8" ry="2.8" transform="rotate(-28 90 35)" stroke="#6f843f" strokeWidth="0.52" />
        {/* Branch 3 */}
        <path d="M 88 88 Q 106 72 118 56" stroke="#6f843f" strokeWidth="0.58" />
        <ellipse cx="114" cy="59" rx="7" ry="2.5" transform="rotate(-20 114 59)" stroke="#6f843f" strokeWidth="0.48" />
        {/* Stem leaves */}
        <ellipse cx="24" cy="24" rx="5.5" ry="2.2" transform="rotate(45 24 24)" stroke="#6f843f" strokeWidth="0.5" />
        <ellipse cx="50" cy="50" rx="6" ry="2.4" transform="rotate(45 50 50)" stroke="#6f843f" strokeWidth="0.5" />
        <ellipse cx="76" cy="76" rx="6.5" ry="2.6" transform="rotate(45 76 76)" stroke="#6f843f" strokeWidth="0.5" />
        <ellipse cx="104" cy="104" rx="7" ry="2.8" transform="rotate(45 104 104)" stroke="#6f843f" strokeWidth="0.48" />
        {/* Corner accent dots */}
        <circle cx="14" cy="14" r="2.5" fill="#8a9b61" fillOpacity="0.45" />
        <circle cx="32" cy="32" r="1.5" fill="#8a9b61" fillOpacity="0.25" />
      </svg>
    </motion.div>
  );
}

const LEAF_POSITIONS = [
  { top: "16%", left: "1.5%", rotate: 18, duration: 9, delay: 0 },
  { top: "44%", left: "1%", rotate: -14, duration: 11.5, delay: 2.5 },
  { top: "74%", left: "2.5%", rotate: 32, duration: 8.5, delay: 1.2 },
  { top: "20%", right: "1.5%", rotate: -22, duration: 10.5, delay: 0.8 },
  { top: "52%", right: "1%", rotate: 12, duration: 12, delay: 3.8 },
  { top: "78%", right: "2.5%", rotate: -38, duration: 9.5, delay: 1.8 },
] as const;

function FloatingLeaves() {
  return (
    <>
      {LEAF_POSITIONS.map((leaf, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{
            top: leaf.top,
            ...(("left" in leaf) ? { left: leaf.left } : {}),
            ...(("right" in leaf) ? { right: (leaf as { right: string }).right } : {}),
          }}
          animate={{
            y: [0, -14, 0],
            rotate: [leaf.rotate, leaf.rotate + 9, leaf.rotate],
            opacity: [0.18, 0.30, 0.18],
          }}
          transition={{
            repeat: Infinity,
            duration: leaf.duration,
            delay: leaf.delay,
            ease: "easeInOut",
          }}
        >
          <LeafSVG />
        </motion.div>
      ))}
    </>
  );
}

function LeafSVG() {
  return (
    <svg width="15" height="25" viewBox="0 0 15 25" fill="none">
      <path
        d="M 7.5 23 Q 1 16 2 7.5 Q 3 1 7.5 2 Q 12 1 13 7.5 Q 14 16 7.5 23 Z"
        stroke="#5a7040"
        strokeWidth="0.7"
        fill="#6f843f"
        fillOpacity="0.14"
      />
      <path d="M 7.5 23 L 7.5 3.5" stroke="#5a7040" strokeWidth="0.4" />
      <path d="M 7.5 13 Q 11 10 13 7.5" stroke="#5a7040" strokeWidth="0.32" />
      <path d="M 7.5 13 Q 4 10 2 7.5" stroke="#5a7040" strokeWidth="0.32" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-[#8a9b61]/20 bg-[#fffdf5]/65 py-2 text-center backdrop-blur-sm">
      <p className="font-display text-xl text-[#4d6135]">{value}</p>
      <p className="font-caption text-[7px] uppercase tracking-[0.22em] text-[#8a9b61]">
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GREEN INVITATION SECTIONS
═══════════════════════════════════════════════════════════ */

function GreenInvitation() {
  return (
    <section className="px-6 py-20 text-center md:py-28">
      <div className="mx-auto max-w-180">
        <p className="font-display text-xl italic leading-8 text-[#fffaf0] md:text-2xl">
          Mr. Baiju S &amp; Mrs. Suratmaja N
          <br />
          Gokulam
          <br />
          Perijamkonam, Vadasserikonam P.O.
        </p>

        <p className="mx-auto mt-10 max-w-xl font-display text-xl italic leading-8 text-white/80 md:text-2xl md:leading-9">
          request the honour of your gracious presence and blessings
          <br />
          with family on the auspicious occasion
          <br />
          of the marriage of their beloved son
        </p>

        <h1 className="mt-12 font-display text-[clamp(1.6rem,7vw,5rem)] uppercase leading-none tracking-[0.08em] sm:tracking-[0.25em] text-[#fffaf0]">
          AMAL BAIJU
        </h1>

        <p className="my-6 font-display text-3xl italic text-white/80 md:text-4xl">and</p>

        <h2 className="font-display text-[clamp(1.5rem,6.8vw,5rem)] uppercase leading-none tracking-[0.06em] sm:tracking-[0.22em] text-[#fffaf0]">
          ATHIRA SUSEELAN
        </h2>

        <p className="mt-10 font-display text-xl italic leading-8 text-white/80 md:text-2xl">
          D/o Mr. Suseelan S &amp; Mrs. Lathakumari S
          <br />
          Athiralayam, Chennancode, Vadasserikonam P.O.
        </p>

        <p className="mt-12 font-caption text-sm uppercase tracking-[0.34em] text-[#fffaf0] md:text-base">
          ON SUNDAY, THE 23RD OF AUGUST
        </p>

        <p className="mt-5 font-caption text-xs uppercase tracking-[0.28em] text-white/70 md:text-sm">
          ◷ &nbsp; AT 11:05 AM - 11:55 AM
        </p>

        <div className="mt-10 space-y-1">
          <p className="font-display text-3xl italic text-[#fffaf0]">Sivagiri Mutt</p>
          <p className="font-display text-2xl italic text-white/80">Sivagiri Rd, Varkala</p>
        </div>

        <a
          href="https://www.google.com/maps/place/Sivagiri+Mutt/@8.7388845,76.7298358,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ef2ca32d60d5:0x64ef9b2fa4d6a0fc!8m2!3d8.7388792!4d76.7324107!16zL20vMGRfNWd5"
          target="_blank"
          rel="noreferrer"
          className="mt-9 inline-block border border-white/40 px-8 py-3 font-caption text-[10px] uppercase tracking-[0.22em] text-[#fffaf0]"
        >
          Open Location →
        </a>

        <div className="mx-auto mt-12 max-w-md border-y border-white/25 py-6">
          <p className="font-caption text-[10px] uppercase tracking-[0.28em] text-white/70">
            Departure Time: 09:30 AM
          </p>
          <p className="mt-3 font-caption text-[10px] uppercase tracking-[0.28em] text-white/70">
            Sweekaranam: 10:30 AM
          </p>
        </div>

        <p className="mt-12 font-display text-2xl italic leading-9 text-white/80">
          We humbly request your presence and blessings,
          <br />
          and kindly discourage gifts.
        </p>
      </div>
    </section>
  );
}

function ScheduleSection() {
  return (
    <section className="border-t border-white/25 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-xl">
        <div className="mb-12 text-center">
          <p className="font-caption text-[9px] uppercase tracking-[0.36em] text-white/60">
            Programme
          </p>
          <h2 className="mt-3 font-display text-4xl text-[#fffaf0]">Order of Events</h2>
        </div>

        <div className="space-y-4">
          {SCHEDULE.map((item) => (
            <div key={item.title} className="border border-white/20 bg-white/5 p-6">
              <p className="font-caption text-[9px] uppercase tracking-[0.26em] text-white/60">
                {item.time}
              </p>
              <h3 className="mt-2 font-display text-2xl text-[#fffaf0]">{item.title}</h3>
              <p className="mt-2 font-body text-base italic leading-7 text-white/75">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RsvpSection({
  rsvpMode,
  setRsvpMode,
  submitted,
  submitting,
  rsvpDuplicate,
  form,
  setForm,
  submitRsvp,
}: {
  rsvpMode: RsvpMode;
  setRsvpMode: (mode: RsvpMode) => void;
  submitted: boolean;
  submitting: boolean;
  rsvpDuplicate: boolean;
  form: {
    name: string;
    guests: string;
    email: string;
    phone: string;
    message: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      guests: string;
      email: string;
      phone: string;
      message: string;
    }>
  >;
  submitRsvp: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section className="border-t border-white/25 px-6 py-16 text-center md:py-24">
      <div className="mx-auto max-w-lg">
        <p className="font-caption text-[9px] uppercase tracking-[0.36em] text-white/60">
          Kindly Reply
        </p>

        <h2 className="mt-3 font-display text-4xl text-[#fffaf0]">Will you attend?</h2>

        <div className="mt-10 border border-white/25 bg-white/5 p-8 md:p-10">
          {!submitted ? (
            <>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setRsvpMode("yes")}
                  className={`px-8 py-4 font-caption text-[10px] uppercase tracking-[0.22em] ${
                    rsvpMode === "yes"
                      ? "bg-[#fffaf0] text-[#4d6135]"
                      : "border border-white/40 text-[#fffaf0]"
                  }`}
                >
                  Yes, I&apos;ll attend
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpMode("no")}
                  className={`px-8 py-4 font-caption text-[10px] uppercase tracking-[0.22em] ${
                    rsvpMode === "no"
                      ? "bg-[#fffaf0] text-[#4d6135]"
                      : "border border-white/40 text-[#fffaf0]"
                  }`}
                >
                  Sorry, can&apos;t make it
                </button>
              </div>

              <AnimatePresence mode="wait">
                {rsvpMode === "yes" && (
                  <motion.form
                    key="attending"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.28 }}
                    onSubmit={submitRsvp}
                    className="mt-8 grid gap-3 text-left"
                  >
                    <RsvpInput
                      required
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                    />
                    <RsvpInput
                      required
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                    <RsvpInput
                      type="tel"
                      placeholder="Phone / WhatsApp"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                    />
                    <textarea
                      rows={3}
                      placeholder="Your wishes / message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full resize-none border border-white/30 bg-white/10 px-5 py-4 font-body text-base italic text-[#fffaf0] outline-none placeholder:text-white/55"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-1 w-full bg-[#fffaf0] px-8 py-4 font-caption text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4d6135] disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit RSVP"}
                    </button>
                  </motion.form>
                )}

                {rsvpMode === "no" && (
                  <motion.div
                    key="not-attending"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.28 }}
                    className="mt-8"
                  >
                    <div className="mb-6 text-center">
                      <p className="font-display text-2xl text-[#fffaf0]">We&apos;ll miss you 🤍</p>
                      <p className="mt-2 font-body text-base italic text-white/70">
                        Send your wishes to Amal &amp; Athira
                      </p>
                    </div>
                    <form onSubmit={submitRsvp} className="grid gap-3 text-left">
                      <RsvpInput
                        required
                        placeholder="Your name"
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                      />
                      <RsvpInput
                        required
                        type="email"
                        placeholder="Your email address"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                      />
                      <textarea
                        rows={4}
                        placeholder="Your wishes / message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full resize-none border border-white/30 bg-white/10 px-5 py-4 font-body text-base italic text-[#fffaf0] outline-none placeholder:text-white/55"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="mt-1 w-full bg-[#fffaf0] px-8 py-4 font-caption text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4d6135] disabled:opacity-60"
                      >
                        {submitting ? "Sending..." : "Send Wishes"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="py-10">
              <CheckCircle2 className="mx-auto text-[#fffaf0]" size={44} />
              <h3 className="mt-5 font-display text-3xl text-[#fffaf0]">Thank you.</h3>
              <p className="mt-2 font-body text-base italic text-white/75">
                {rsvpDuplicate
                  ? "This email address has already been used. Your RSVP or wishes have already been delivered successfully."
                  : "Your response has been received."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEIERA FOOTER
═══════════════════════════════════════════════════════════ */

function FooterSection() {
  return (
    <footer className="border-t border-white/15 px-6 pb-12 pt-10 text-center">
      <div className="mx-auto max-w-xs">
        <p className="font-display text-sm italic text-white/52">
          An invitation experience by{" "}
          <span className="not-italic tracking-[0.06em]">{EVENT_META.product}</span>
        </p>
        <p className="mt-2 font-caption text-[8px] uppercase tracking-[0.3em] text-white/36">
          Part of the {EVENT_META.parentBrand} family
        </p>
        <div className="mx-auto my-4 h-px w-8 bg-white/18" />
        <p className="font-caption text-[7.5px] uppercase tracking-[0.2em] text-white/28">
          &copy; 2026 {EVENT_META.parentBrand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function RsvpInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <input
      required={required}
      type={type}
      min={min}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-white/30 bg-white/10 px-5 py-4 font-body text-base italic text-[#fffaf0] outline-none placeholder:text-white/55"
    />
  );
}
