"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Gem,
  Gift,
  Mail,
  PlayCircle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

type RsvpMode = "yes" | "no" | null;

type IconProps = {
  icon: LucideIcon;
  title: string;
  sub?: string;
  text?: string;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const wedding = {
  brand: "A & A",
  bride: "ATHIRA",
  groom: "AMAL",
  date: "23 AUG 2026",
  day: "Sunday",
  time: "11:00 AM",
  venue: "Sivagiri Mutt",
  location: "Sivagiri Rd, Varkala",
  mapsUrl:
    "https://www.google.com/maps/place/Sivagiri+Mutt/@8.7388845,76.7298358,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ef2ca32d60d5:0x64ef9b2fa4d6a0fc!8m2!3d8.7388792!4d76.7324107!16zL20vMGRfNWd5",
  contact: "+91 98765 43210",
};

const schedule = [
  {
    time: "22 AUG 2026 · 3:00 PM",
    title: "Bride House Gathering",
    desc: "A small family party and warm pre-wedding celebration at the bride’s house.",
  },
  {
    time: "23 AUG 2026 · 10:30 AM",
    title: "Guest Arrival",
    desc: "Guests arrive at Sivagiri Mutt and join the family.",
  },
  {
    time: "23 AUG 2026 · 11:00 AM",
    title: "Wedding Ceremony",
    desc: "Wedding ceremony with blessings from family and loved ones.",
  },
  {
    time: "After Ceremony",
    title: "Lunch & Blessings",
    desc: "Lunch, photos, family gathering and celebration.",
  },
];

export default function WeddingInvitation() {
  const [opened, setOpened] = useState(false);
  const [rsvpMode, setRsvpMode] = useState<RsvpMode>(null);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [form, setForm] = useState({
    name: "",
    guests: "1",
    phone: "",
    message: "",
  });

  const coupleName = useMemo(() => `${wedding.groom} & ${wedding.bride}`, []);

  useEffect(() => {
    const weddingDate = new Date("2026-08-23T11:00:00+05:30").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function submitRsvp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const response = {
      name: form.name,
      attending: rsvpMode === "yes",
      guest_count: rsvpMode === "yes" ? Number(form.guests || 1) : 0,
      phone: form.phone,
      message: form.message,
      created_at: new Date().toISOString(),
    };

    console.log("RSVP response:", response);
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff7f8] text-[#2b2024]">
      <motion.div
        className="pointer-events-none fixed left-[-120px] top-[160px] h-80 w-80 rounded-full bg-[#f3c8d1]/50 blur-3xl"
        animate={{ x: [0, 80, 20, 0], y: [0, 40, 100, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none fixed right-[-120px] bottom-[120px] h-96 w-96 rounded-full bg-[#c9a24d]/20 blur-3xl"
        animate={{ x: [0, -80, -30, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#f0dce1] bg-[#fff7f8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="font-serif text-2xl tracking-tight text-[#b76e79]">{wedding.brand}</div>

          <nav className="hidden items-center gap-10 text-xs font-medium uppercase tracking-[0.16em] text-[#6f5f62] md:flex">
            <a href="#story">Our Story</a>
            <a href="#info">Wedding Info</a>
            <a href="#schedule">Schedule</a>
            <a href="#rsvp">RSVP</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpened(true)}
              className="hidden border border-[#e5c8ce] px-6 py-3 text-sm font-medium md:block"
            >
              Open Invite
            </button>

            <a
              href="#rsvp"
              className="bg-[#b76e79] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#b76e79]/20"
            >
              RSVP Now →
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        <section
          id="story"
          className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10"
          >
            <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b76e79]">
              <span className="h-px w-7 bg-[#b76e79]" /> You’re invited
            </div>

            <h1 className="max-w-xl font-serif text-6xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              Two hearts.
              <br /> One promise.
              <br />
              <span className="italic text-[#b76e79]">A lifetime together.</span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-8 text-[#6f5f62]">
              We joyfully invite you to be part of our wedding celebration and bless us with your love and presence.
            </p>

            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              <InfoMini icon={Calendar} title={wedding.date} sub={wedding.day} />
              <InfoMini icon={Clock} title={wedding.time} sub="Wedding Ceremony" />
              <InfoMini icon={MapPin} title={wedding.venue} sub={wedding.location} />
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-4 gap-3">
              <CountdownBox value={countdown.days} label="Days" />
              <CountdownBox value={countdown.hours} label="Hours" />
              <CountdownBox value={countdown.minutes} label="Mins" />
              <CountdownBox value={countdown.seconds} label="Secs" />
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setOpened(true)}
                className="bg-[#b76e79] px-8 py-4 font-semibold text-white shadow-xl shadow-[#b76e79]/20 transition hover:-translate-y-0.5"
              >
                Open Invitation →
              </button>

              <button className="flex items-center gap-3 border border-[#e5c8ce] px-8 py-4 font-semibold transition hover:bg-white/70">
                <PlayCircle size={19} /> Watch Our Story
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{
              opacity: 1,
              y: [0, -12, 0],
              rotate: [-1, 1, -1],
            }}
            transition={{
              opacity: { duration: 0.9 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-10"
          >
            <div className="absolute -right-10 -top-8 h-[520px] w-[360px] rotate-6 rounded-3xl bg-[#f7e6ea] shadow-2xl" />

            <div className="relative mx-auto max-w-md rounded-3xl border border-[#c9a24d] bg-[#fffdf9] p-10 text-center shadow-2xl shadow-black/10">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[#c9a24d] font-serif text-3xl text-[#b76e79]">
                {wedding.brand}
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6a68]">
                Together with their families
              </p>

              <h2 className="mt-8 font-serif text-5xl uppercase tracking-[0.18em]">{wedding.groom}</h2>
              <p className="my-4 font-serif text-3xl italic text-[#b76e79]">and</p>
              <h2 className="font-serif text-5xl uppercase tracking-[0.18em]">{wedding.bride}</h2>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#7b6a68]">
                Joyfully invite you to celebrate their wedding
              </p>

              <div className="my-8 h-px bg-[#c9a24d]" />

              <p className="font-serif text-4xl text-[#b76e79]">23</p>
              <p className="mt-2 text-sm uppercase tracking-[0.28em]">August 2026</p>
              <p className="mt-4 text-sm uppercase tracking-[0.22em]">{wedding.time}</p>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em]">{wedding.venue}</p>
              <p className="mt-2 text-sm text-[#7b6a68]">{wedding.location}</p>
            </div>
          </motion.div>
        </section>

        <RevealSection id="info">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="rounded-3xl border border-[#f0dce1] bg-white/70 p-8 shadow-xl shadow-black/5 md:p-12">
              <h2 className="font-serif text-5xl">Wedding Info</h2>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <InfoCard icon={Gem} title={coupleName} text="With love, blessings and family presence." />
                <InfoCard icon={MapPin} title={wedding.venue} text={`${wedding.location}. Tap below for map.`} />
                <InfoCard icon={Mail} title="Bride House Party" text="22 August 2026 from 3:00 PM onwards." />
              </div>

              <a
                href={wedding.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block bg-[#2b2024] px-7 py-4 font-semibold text-white"
              >
                Open Google Maps →
              </a>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="schedule">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="font-serif text-5xl">Schedule</h2>

            <div className="mt-10 grid gap-5 md:grid-cols-4">
              {schedule.map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-3xl border border-[#f0dce1] bg-[#fffdf9] p-6 shadow-lg shadow-black/5"
                >
                  <p className="text-sm font-semibold text-[#b76e79]">{item.time}</p>
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#7b6a68]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection id="rsvp">
          <div className="mx-auto max-w-4xl px-6 py-24">
            <div className="rounded-[2rem] border border-[#f0dce1] bg-white p-8 text-center shadow-2xl shadow-black/5 md:p-12">
              <Gift className="mx-auto text-[#b76e79]" size={34} />
              <h2 className="mt-6 font-serif text-5xl">Will you attend?</h2>

              <p className="mx-auto mt-4 max-w-xl text-[#7b6a68]">
                Please let us know if you’ll be joining us, so we can plan the celebration beautifully.
              </p>

              {!submitted ? (
                <>
                  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      onClick={() => setRsvpMode("yes")}
                      className={`px-7 py-4 font-semibold ${
                        rsvpMode === "yes" ? "bg-[#b76e79] text-white" : "border border-[#e5c8ce]"
                      }`}
                    >
                      Yes, I will attend
                    </button>

                    <button
                      onClick={() => setRsvpMode("no")}
                      className={`px-7 py-4 font-semibold ${
                        rsvpMode === "no" ? "bg-[#2b2024] text-white" : "border border-[#e5c8ce]"
                      }`}
                    >
                      Sorry, I can’t attend
                    </button>
                  </div>

                  <AnimatePresence>
                    {rsvpMode && (
                      <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onSubmit={submitRsvp}
                        className="mx-auto mt-8 grid max-w-xl gap-4 text-left"
                      >
                        <input
                          required
                          placeholder="Full name"
                          className="border border-[#e5c8ce] bg-[#fff7f8] px-5 py-4 outline-none"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        {rsvpMode === "yes" && (
                          <>
                            <input
                              type="number"
                              min="1"
                              placeholder="How many guests?"
                              className="border border-[#e5c8ce] bg-[#fff7f8] px-5 py-4 outline-none"
                              value={form.guests}
                              onChange={(e) => setForm({ ...form, guests: e.target.value })}
                            />

                            <input
                              placeholder="Phone / WhatsApp"
                              className="border border-[#e5c8ce] bg-[#fff7f8] px-5 py-4 outline-none"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                          </>
                        )}

                        <textarea
                          placeholder={rsvpMode === "yes" ? "Message or wishes" : "Your wishes/message"}
                          rows={4}
                          className="border border-[#e5c8ce] bg-[#fff7f8] px-5 py-4 outline-none"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />

                        <button className="bg-[#b76e79] px-8 py-4 font-semibold text-white">
                          Submit RSVP
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 rounded-3xl bg-[#f9e8ec] p-8"
                >
                  <CheckCircle2 className="mx-auto text-[#b76e79]" size={42} />
                  <h3 className="mt-4 text-2xl font-semibold">Thank you. Your response has been received.</h3>
                </motion.div>
              )}
            </div>
          </div>
        </RevealSection>
      </main>

      <InvitationModal opened={opened} onClose={() => setOpened(false)} />
    </div>
  );
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-[#f0dce1] bg-[#fffdf9]/80 p-4 text-center shadow-sm backdrop-blur"
    >
      <p className="font-serif text-3xl text-[#b76e79]">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#7b6a68]">{label}</p>
    </motion.div>
  );
}

function RevealSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

function InfoMini({ icon: Icon, title, sub }: IconProps) {
  return (
    <div className="flex items-start gap-3 border-r border-[#f0dce1] last:border-r-0">
      <div className="mt-1 text-[#b76e79]">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-[#7b6a68]">{sub}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: IconProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-[#f0dce1] bg-[#fffdf9] p-6 shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="text-[#b76e79]">
        <Icon size={30} />
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#7b6a68]">{text}</p>
    </motion.div>
  );
}

function InvitationModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {opened && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 70 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.7 }}
            className="relative max-w-lg rounded-[2rem] border border-[#c9a24d] bg-[#fffdf9] p-10 text-center shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-[#7b6a68]">
              ✕
            </button>

            <Heart className="mx-auto text-[#b76e79]" size={34} />

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6a68]">
              Wedding Invitation
            </p>

            <h2 className="mt-6 font-serif text-5xl">
              {wedding.groom} & {wedding.bride}
            </h2>

            <p className="mt-6 leading-7 text-[#7b6a68]">
              Together with their families, joyfully invite you to celebrate their wedding.
            </p>

            <div className="my-8 h-px bg-[#c9a24d]" />

            <p className="text-2xl font-semibold text-[#b76e79]">{wedding.date}</p>
            <p className="mt-2">{wedding.time}</p>
            <p className="mt-5 font-semibold">{wedding.venue}</p>
            <p className="text-[#7b6a68]">{wedding.location}</p>

            <a
              href="#rsvp"
              onClick={onClose}
              className="mt-8 inline-block bg-[#b76e79] px-8 py-4 font-semibold text-white"
            >
              RSVP Now →
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}