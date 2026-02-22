"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  TrendingDown,
  Clock,
  Users,
  ArrowRight,
  Diamond,
  Terminal,
  Zap,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen noise-texture" style={{ background: "var(--cream)" }}>
      {/* Navigation - Art Deco Style */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{
          borderBottom: "2px solid var(--gold)",
          background: "rgba(250, 246, 240, 0.95)",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Diamond className="h-8 w-8" style={{ color: "var(--gold)" }} />
              <span
                className="display-font text-3xl"
                style={{ color: "var(--navy-900)" }}
              >
                REQFLOW
              </span>
            </motion.div>
            <div className="flex items-center gap-6">
              <button
                className="mono-font text-sm tracking-wide"
                style={{ color: "var(--navy-700)" }}
              >
                SIGN IN
              </button>
              <button
                className="metallic-button px-8 py-3 mono-font text-sm font-bold tracking-wide"
                style={{ color: "var(--navy-900)" }}
              >
                GET STARTED →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dramatic Art Deco */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 50%, var(--charcoal) 100%)`,
          paddingTop: "8rem",
          paddingBottom: "10rem",
        }}
      >
        {/* Geometric Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              var(--gold) 0px,
              var(--gold) 2px,
              transparent 2px,
              transparent 40px
            )`,
          }}
        />

        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8 relative z-10">
          <div className="max-w-5xl">
            {/* Terminal-style badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 mono-font text-xs font-bold tracking-widest"
              style={{
                border: "1px solid var(--mint)",
                background: "rgba(127, 255, 212, 0.1)",
                color: "var(--mint)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Terminal className="h-3 w-3" />
              <span>50–500 EMPLOYEES // NO PROCUREMENT TEAM</span>
            </motion.div>

            {/* Main headline - Art Deco Typography */}
            <motion.h1
              className="display-font mb-8"
              style={{
                fontSize: "clamp(3rem, 8vw, 7rem)",
                lineHeight: "1.1",
                color: "var(--cream)",
                textShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              EVERY PURCHASE.
              <br />
              <span style={{ color: "var(--gold)" }}>ONE COMMAND CENTER.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="mono-font text-lg mb-12 max-w-2xl"
              style={{
                color: "var(--mint)",
                lineHeight: "1.8",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              THE AI-POWERED PROCUREMENT TERMINAL FOR COMPANIES THAT DON'T HAVE (AND DON'T WANT) A PROCUREMENT DEPARTMENT.
              <br />
              <span style={{ color: "var(--silver)" }}>
                TURN CHAOS INTO CONTROL. TURN DAYS INTO HOURS. TURN GUESSWORK INTO DATA.
              </span>
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex gap-6 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <input
                type="email"
                placeholder="your@company.com"
                className="px-6 py-4 mono-font text-sm border-2"
                style={{
                  background: "rgba(250, 246, 240, 0.1)",
                  borderColor: "var(--gold)",
                  color: "var(--cream)",
                  width: "320px",
                }}
              />
              <button
                className="metallic-button px-10 py-4 mono-font text-sm font-bold tracking-wide flex items-center gap-3"
                style={{ color: "var(--navy-900)" }}
              >
                START 14-DAY TRIAL
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            <p className="mono-font text-xs mt-6" style={{ color: "var(--silver)" }}>
              NO CREDIT CARD // 5-MINUTE SETUP // CANCEL ANYTIME
            </p>
          </div>

          {/* Diagonal gold accent */}
          <div
            className="absolute -right-32 -bottom-32 w-96 h-96 opacity-20"
            style={{
              background: "var(--gold)",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </section>

      {/* Stats Terminal - Financial Display Style */}
      <section
        className="diagonal-section"
        style={{
          background: "var(--navy-900)",
          borderTop: "4px solid var(--gold)",
          borderBottom: "4px solid var(--gold)",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: 90, suffix: "%+", label: "REQUEST ADOPTION RATE", delay: 0.1 },
              { value: 4, suffix: "HR", label: "MEDIAN APPROVAL TIME", delay: 0.2 },
              { value: 80, suffix: "%", label: "TIME SAVED ON PROCUREMENT", delay: 0.3 },
              { value: 0, prefix: "€", suffix: "", label: "INFRASTRUCTURE COST", delay: 0.4 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: stat.delay }}
              >
                <div
                  className="display-font mb-2"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    color: "var(--gold)",
                    textShadow: "0 0 30px rgba(212, 175, 55, 0.5)",
                  }}
                >
                  <AnimatedCounter
                    end={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <div
                  className="mono-font text-xs font-bold tracking-widest"
                  style={{ color: "var(--mint)" }}
                >
                  {stat.label}
                </div>
                <div className="mt-3 deco-divider" style={{ maxWidth: "120px", margin: "12px auto 0" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section - Asymmetric Layout */}
      <section style={{ padding: "var(--section-padding) 0" }}>
        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8">
          <motion.div
            className="max-w-3xl mb-20"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="display-font mb-6"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                color: "var(--navy-900)",
                lineHeight: "1.2",
              }}
            >
              YOU'RE SPENDING <span style={{ color: "var(--gold)" }}>30% OF YOUR TIME</span>
              <br />
              ON PROCUREMENT TASKS YOU WERE NEVER HIRED TO DO
            </h2>
            <p className="mono-font text-base" style={{ color: "var(--navy-700)", lineHeight: "1.8" }}>
              Scattered Slack messages. Email chains. The CFO finding out about subscriptions
              on the credit card statement. There's no front door for purchase requests.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingDown,
                stat: "40-60%",
                title: "MAVERICK SPEND",
                desc: "Purchases happening off-policy because there is no policy engine to enforce rules.",
              },
              {
                icon: Clock,
                stat: "11.4 DAYS",
                title: "AVERAGE WAIT",
                desc: 'From "I need this" to "I have this" for a simple $500/month SaaS tool.',
              },
              {
                icon: Users,
                stat: "8.3 HRS/WK",
                title: "TIME WASTED",
                desc: "Finance team members waste on manual procurement tasks instead of strategic work.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="geo-border"
                style={{ background: "white" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className="h-12 w-12 mb-4" style={{ color: "var(--gold)" }} />
                <div
                  className="display-font text-3xl mb-2"
                  style={{ color: "var(--navy-900)" }}
                >
                  {item.stat}
                </div>
                <h3
                  className="mono-font text-xs font-bold tracking-widest mb-3"
                  style={{ color: "var(--navy-700)" }}
                >
                  {item.title}
                </h3>
                <p className="mono-font text-sm" style={{ color: "var(--navy-700)", lineHeight: "1.6" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Terminal Steps */}
      <section
        className="diagonal-section"
        style={{
          background: "linear-gradient(135deg, var(--navy-800) 0%, var(--navy-900) 100%)",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8">
          <h2
            className="display-font text-center mb-20"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "var(--cream)",
            }}
          >
            FROM REQUEST TO APPROVAL
            <br />
            <span style={{ color: "var(--gold)" }}>IN MINUTES, NOT DAYS</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                num: "01",
                title: "SUBMIT VIA SLACK",
                desc: 'Type /reqflow buy and fill a 2-minute adaptive form. AI categorizes and checks for duplicates automatically.',
              },
              {
                num: "02",
                title: "SMART ROUTING",
                desc: "Request routes to the right approvers based on amount, category, and department. Budget checked in real-time.",
              },
              {
                num: "03",
                title: "APPROVE & TRACK",
                desc: "Approvers get push notifications with full context. One-click approve from mobile. Full audit trail automatically.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div
                  className="display-font mb-6"
                  style={{
                    fontSize: "6rem",
                    color: "var(--gold)",
                    opacity: 0.2,
                    lineHeight: "1",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="mono-font text-sm font-bold tracking-widest mb-4"
                  style={{ color: "var(--mint)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="mono-font text-sm"
                  style={{ color: "var(--silver)", lineHeight: "1.8" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Bold Metallic */}
      <section
        style={{
          padding: "var(--section-padding) 0",
          background: "var(--navy-900)",
          borderTop: "4px solid var(--gold)",
        }}
      >
        <div
          style={{ maxWidth: "var(--container-max)" }}
          className="mx-auto px-8 text-center"
        >
          <h2
            className="display-font mb-6"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: "var(--cream)",
            }}
          >
            READY TO TURN
            <br />
            <span style={{ color: "var(--gold)" }}>CHAOS INTO CONTROL?</span>
          </h2>
          <p
            className="mono-font text-lg mb-12"
            style={{ color: "var(--mint)" }}
          >
            JOIN COMPANIES THAT HAVE RECLAIMED 8+ HOURS PER WEEK WITH REQFLOW
          </p>

          <div className="flex gap-6 justify-center items-center flex-wrap">
            <input
              type="email"
              placeholder="your@company.com"
              className="px-8 py-5 mono-font text-sm border-2"
              style={{
                background: "rgba(250, 246, 240, 0.1)",
                borderColor: "var(--gold)",
                color: "var(--cream)",
                width: "360px",
              }}
            />
            <button
              className="metallic-button px-12 py-5 mono-font text-sm font-bold tracking-wide flex items-center gap-3"
              style={{ color: "var(--navy-900)", fontSize: "1rem" }}
            >
              START 14-DAY TRIAL
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <p className="mono-font text-xs mt-8" style={{ color: "var(--silver)" }}>
            14-DAY TRIAL // NO CREDIT CARD // LIVE IN 5 MINUTES
          </p>
        </div>
      </section>

      {/* Footer - Art Deco Minimal */}
      <footer
        style={{
          background: "var(--charcoal)",
          borderTop: "1px solid var(--gold)",
          padding: "4rem 0 2rem",
        }}
      >
        <div style={{ maxWidth: "var(--container-max)" }} className="mx-auto px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Diamond className="h-6 w-6" style={{ color: "var(--gold)" }} />
              <span
                className="display-font text-2xl"
                style={{ color: "var(--cream)" }}
              >
                REQFLOW
              </span>
            </div>
            <p className="mono-font text-xs" style={{ color: "var(--silver)" }}>
              © 2026 REQFLOW. BUILT WITH €0 INFRASTRUCTURE COST.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
