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
  brand: "Amal & Athira",
  bride: "ATHIRA",
  groom: "AMAL",
  date: "23 AUG 2026",
  day: "Sunday",
  time: "11:00 AM",
  venue: "Sivagiri Mutt",
  location: "Sivagiri Rd, Varkala",
  mapsUrl:
    "https://www.google.com/maps/place/Sivagiri+Mutt/@8.7388845,76.7298358,17z/data=!3m1!4b1!4m6!3m5!1s0x3b05ef2ca32d60d5:0x64ef9b2fa4d6a0fc!8m2!3d8.7388792!4d76.7324107!16zL20vMGRfNWd5",
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
  const [submitting, setSubmitting] = useState(false);

  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [form, setForm] = useState({
    name: "",
    guests: "1",
    email: "",
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

  async function submitRsvp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!rsvpMode) {
      alert("Please select Yes or No.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          attending: rsvpMode === "yes",
          guest_count: rsvpMode === "yes" ? Number(form.guests || 1) : 0,
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbff] text-[#0b2341]">
      <motion.div
        className="pointer-events-none fixed left-[-120px] top-[160px] h-80 w-80 rounded-full bg-[#9fc3e8]/40 blur-3xl"
        animate={{ x: [0, 80, 20, 0], y: [0, 40, 100, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none fixed right-[-120px] bottom-[120px] h-96 w-96 rounded-full bg-[#d7b46a]/20 blur-3xl"
        animate={{ x: [0, -80, -30, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#dbe7f4] bg-[#f7fbff]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="font-serif text-2xl tracking-tight text-[#0b2341]">
            {wedding.brand}
          </div>

          <nav className="hidden items-center gap-10 text-xs font-medium uppercase tracking-[0.16em] text-[#415875] md:flex">
            <a href="#story">Our Story</a>
            <a href="#info">Wedding Info</a>
            <a href="#schedule">Schedule</a>
            <a href="#rsvp">RSVP</a>
          </nav>

          <a
            href="#rsvp"
            className="bg-[#0b3a6f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0b3a6f]/20"
          >
            RSVP Now →
          </a>
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
          >
            <div className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a2d]">
              <span className="h-px w-7 bg-[#b88a2d]" /> You’re invited
            </div>

            <h1 className="max-w-xl font-serif text-6xl leading-[0.95] tracking-tight text-[#0b2341] md:text-7xl lg:text-8xl">
              Two hearts.
              <br /> One promise.
              <br />
              <span className="italic text-[#2f6fa8]">A lifetime together.</span>
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-8 text-[#415875]">
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
                className="bg-[#0b3a6f] px-8 py-4 font-semibold text-white shadow-xl shadow-[#0b3a6f]/20 transition hover:-translate-y-0.5"
              >
                Open Invitation →
              </button>

              <button className="flex items-center gap-3 border border-[#9fb3c9] px-8 py-4 font-semibold transition hover:bg-white/70">
                <PlayCircle size={19} /> Watch Our Story
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: [0, -12, 0], rotate: [-1, 1, -1] }}
            transition={{
              opacity: { duration: 0.9 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-10"
          >
            <div className="absolute -right-10 -top-8 h-[520px] w-[360px] rotate-6 rounded-3xl bg-[#d7e8f8] shadow-2xl" />

            <div className="relative mx-auto max-w-md rounded-3xl border border-[#d7b46a] bg-[#fffdf8] p-10 text-center shadow-2xl shadow-[#0b2341]/10">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[#d7b46a] font-serif text-2xl text-[#0b3a6f]">
                A | A
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#60728a]">
                Together with their families
              </p>

              <h2 className="mt-8 font-serif text-5xl uppercase tracking-[0.18em] text-[#0b2341]">
                {wedding.groom}
              </h2>
              <p className="my-4 font-serif text-3xl italic text-[#b88a2d]">and</p>
              <h2 className="font-serif text-5xl uppercase tracking-[0.18em] text-[#0b2341]">
                {wedding.bride}
              </h2>

              <div className="my-8 h-px bg-[#d7b46a]" />

              <p className="font-serif text-4xl text-[#2f6fa8]">23</p>
              <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[#0b2341]">
                August 2026
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.22em] text-[#415875]">
                {wedding.time}
              </p>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#0b2341]">
                {wedding.venue}
              </p>
              <p className="mt-2 text-sm text-[#60728a]">{wedding.location}</p>
            </div>
          </motion.div>
        </section>

        <RevealSection id="info">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="rounded-3xl border border-[#dbe7f4] bg-white/70 p-8 shadow-xl shadow-[#0b2341]/5 md:p-12">
              <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a2d]">
                <span className="h-px w-7 bg-[#b88a2d]" /> Wedding Info
              </div>

              <h2 className="font-serif text-5xl text-[#0b2341]">The Details</h2>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <InfoCard icon={Gem} title={coupleName} text="With love, blessings and family presence." />
                <InfoCard icon={MapPin} title={wedding.venue} text={`${wedding.location}. Tap below for map.`} />
                <InfoCard icon={Mail} title="Bride House Party" text="22 August 2026 from 3:00 PM onwards." />
              </div>

              <a
                href={wedding.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block bg-[#0b3a6f] px-7 py-4 font-semibold text-white"
              >
                Open Google Maps →
              </a>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="schedule">
          <div className="bg-[#082c55] py-24 text-white">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-center font-serif text-5xl">The Celebration</h2>

              <div className="mt-12 grid gap-5 md:grid-cols-4">
                {schedule.map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-3xl border border-white/20 bg-white/5 p-6 text-center shadow-lg backdrop-blur"
                  >
                    <p className="text-sm font-semibold text-[#d7b46a]">{item.time}</p>
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/75">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="rsvp">
          <div className="mx-auto max-w-4xl px-6 py-24">
            <div className="rounded-[2rem] border border-[#dbe7f4] bg-white p-8 text-center shadow-2xl shadow-[#0b2341]/5 md:p-12">
              <Gift className="mx-auto text-[#2f6fa8]" size={34} />

              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a2d]">
                Kindly Reply
              </div>

              <h2 className="mt-4 font-serif text-5xl text-[#0b2341]">Will you attend?</h2>

              {!submitted ? (
                <>
                  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setRsvpMode("yes")}
                      className={`px-7 py-4 font-semibold ${
                        rsvpMode === "yes" ? "bg-[#0b3a6f] text-white" : "border border-[#9fb3c9]"
                      }`}
                    >
                      Yes, I will attend
                    </button>

                    <button
                      type="button"
                      onClick={() => setRsvpMode("no")}
                      className={`px-7 py-4 font-semibold ${
                        rsvpMode === "no" ? "bg-[#0b2341] text-white" : "border border-[#9fb3c9]"
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
                          className="border border-[#dbe7f4] bg-[#f7fbff] px-5 py-4 outline-none"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <input
                          required
                          type="email"
                          placeholder="Email address"
                          className="border border-[#dbe7f4] bg-[#f7fbff] px-5 py-4 outline-none"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        {rsvpMode === "yes" && (
                          <input
                            type="number"
                            min="1"
                            placeholder="How many guests?"
                            className="border border-[#dbe7f4] bg-[#f7fbff] px-5 py-4 outline-none"
                            value={form.guests}
                            onChange={(e) => setForm({ ...form, guests: e.target.value })}
                          />
                        )}

                        <input
                          placeholder="Phone / WhatsApp"
                          className="border border-[#dbe7f4] bg-[#f7fbff] px-5 py-4 outline-none"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <textarea
                          placeholder={rsvpMode === "yes" ? "Message or wishes" : "Your wishes/message"}
                          rows={4}
                          className="border border-[#dbe7f4] bg-[#f7fbff] px-5 py-4 outline-none"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />

                        <button
                          disabled={submitting}
                          className="bg-[#0b3a6f] px-8 py-4 font-semibold text-white disabled:opacity-60"
                        >
                          {submitting ? "Submitting..." : "Submit RSVP"}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 rounded-3xl bg-[#eaf4ff] p-8"
                >
                  <CheckCircle2 className="mx-auto text-[#2f6fa8]" size={42} />
                  <h3 className="mt-4 text-2xl font-semibold">
                    Thank you. Your response has been received.
                  </h3>
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
      className="rounded-2xl border border-[#dbe7f4] bg-white/80 p-4 text-center shadow-sm backdrop-blur"
    >
      <p className="font-serif text-3xl text-[#0b3a6f]">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#b88a2d]">{label}</p>
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
    <div className="flex items-start gap-3 border-r border-[#dbe7f4] last:border-r-0">
      <div className="mt-1 text-[#2f6fa8]">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-semibold text-[#0b2341]">{title}</p>
        <p className="mt-1 text-sm text-[#60728a]">{sub}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: IconProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-[#dbe7f4] bg-[#fffdf8] p-6 shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="text-[#2f6fa8]">
        <Icon size={30} />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-[#0b2341]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#60728a]">{text}</p>
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b2341]/50 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 70 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.7 }}
            className="relative max-w-lg rounded-[2rem] border border-[#d7b46a] bg-[#fffdf8] p-10 text-center shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-[#60728a]">
              ✕
            </button>

            <Heart className="mx-auto text-[#2f6fa8]" size={34} />

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#60728a]">
              Wedding Invitation
            </p>

            <h2 className="mt-6 font-serif text-5xl text-[#0b2341]">Amal & Athira</h2>

            <p className="mt-6 leading-7 text-[#60728a]">
              Together with their families, joyfully invite you to celebrate their wedding.
            </p>

            <div className="my-8 h-px bg-[#d7b46a]" />

            <p className="text-2xl font-semibold text-[#2f6fa8]">{wedding.date}</p>
            <p className="mt-2 text-[#0b2341]">{wedding.time}</p>
            <p className="mt-5 font-semibold text-[#0b2341]">{wedding.venue}</p>
            <p className="text-[#60728a]">{wedding.location}</p>

            <a
              href="#rsvp"
              onClick={onClose}
              className="mt-8 inline-block bg-[#0b3a6f] px-8 py-4 font-semibold text-white"
            >
              RSVP Now →
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}