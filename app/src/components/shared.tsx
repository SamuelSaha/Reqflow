"use client";

import { useEffect, useRef, useState } from "react";

export const COLORS = {
  bg: "#ffffff",
  text: "#0a0a0a",
  textMuted: "#737373",
  border: "#e5e5e5",
  surface: "#f9f9f9",
  accent: "#2563EB",
  gradient1: "#2563EB",
  gradient2: "#1D4ED8",
  accentGlow: "rgba(37, 99, 235, 0.2)",
};

/* ───── SCROLL PROGRESS ───── */
export const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: COLORS.border,
      zIndex: 1000,
    }}>
      <div style={{
        height: "100%",
        background: COLORS.text,
        width: `${scrollProgress}%`,
        transition: "width 0.1s ease",
      }} />
    </div>
  );
};

/* ───── SCROLL REVEAL HOOK ───── */
export const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isVisible] as const;
};

/* ───── NAV ───── */
export const Nav = () => (
  <nav style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`,
  }}>
    <div style={{
      maxWidth: 640, margin: "0 auto", padding: "20px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <a href="/" style={{
        fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
        color: COLORS.text, textDecoration: "none",
      }}>Reqflow</a>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <a href="/features" style={{ fontSize: 14, color: COLORS.textMuted, textDecoration: "none" }}>Features</a>
        <a href="/pricing" style={{ fontSize: 14, color: COLORS.textMuted, textDecoration: "none" }}>Pricing</a>
      </div>
    </div>
  </nav>
);

/* ───── FOOTER ───── */
export const Footer = () => (
  <footer style={{
    borderTop: `1px solid ${COLORS.border}`,
    padding: "32px 24px",
  }}>
    <div style={{
      maxWidth: 640, margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 24,
    }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted }}>
        © 2026 Reqflow
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Contact", href: "/contact" },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{ fontSize: 13, color: COLORS.textMuted, textDecoration: "none" }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
