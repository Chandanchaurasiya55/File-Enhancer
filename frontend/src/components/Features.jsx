import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Features.css";

const mainFeatures = [
  {
    id: "01",
    icon: "🎬",
    title: "Video Compression",
    description: "Reduce video file sizes by up to 95% without quality loss",
    detail:
      "Compress videos instantly while maintaining professional quality. Perfect for sharing, uploading, and storage across all platforms.",
    highlights: [
      "MP4, MOV, AVI, MKV, WEBM, HEVC",
      "HD & 4K support",
      "Batch processing",
    ],
  },
  {
    id: "02",
    icon: "✨",
    title: "Video Enhancement",
    description: "Elevate video quality with AI-powered enhancements",
    detail:
      "Transform ordinary footage into professional-quality videos using advanced neural networks and machine learning algorithms.",
    highlights: ["Auto upscaling", "Noise reduction", "Color grading"],
  },
  {
    id: "03",
    icon: "📄",
    title: "Format Conversion",
    description: "Convert documents, PDFs, and images seamlessly",
    detail:
      "Convert between multiple document and image formats instantly. Supports all major file types with zero quality loss, every time.",
    highlights: ["PDF ↔ PNG / JPG", "DOCX ↔ PDF / HTML / TXT", "XLSX ↔ PDF / CSV"],
  },
];

const aiFeatures = [
  { icon: "📈", title: "Image Upscaling",      desc: "Enlarge photos without quality loss" },
  { icon: "✨", title: "Blur Remove / Sharpen", desc: "Clarify blurry photos and enhance details" },
  { icon: "🔇", title: "Noise Removal",         desc: "Clean dark and grainy photos" },
  { icon: "🎨", title: "Old Photo Restore",     desc: "Repair faded photos and colorize B&W" },
  { icon: "🎯", title: "Background Remove",     desc: "Remove backgrounds for transparent PNGs" },
  { icon: "👤", title: "Face Enhancement",      desc: "Enhance faces with skin smoothing & tone balance" },
  { icon: "🌈", title: "Color Correction",      desc: "Adjust brightness and improve contrast" },
  { icon: "🚫", title: "AI Object Remove",      desc: "Remove unwanted objects with precision" },
];

const CheckIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" className="feat-check-svg">
    <polyline points="2,5 4,7 8,3" />
  </svg>
);

const Features = () => {
  const navigate = useNavigate();
  const rowRefs  = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.08, rootMargin: "30px" }
    );

    rowRefs.current.forEach((el) => el && observer.observe(el));
    cardRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-page">
      {/* Ambient background */}
      <div className="features-ambient" aria-hidden="true" />

      {/* ── HERO ── */}
      <div className="features-hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          All-in-One Media Platform
        </div>
        <h1 className="hero-title">
          Features Built for<br />
          <em>Every Creator</em>
        </h1>
        <p className="hero-sub">
          Compress, enhance, convert, and transform your media with tools that actually work.
        </p>
      </div>

      {/* ── MAIN FEATURES ── */}
      <div className="features-flow">
        {mainFeatures.map((feat, i) => (
          <div
            key={feat.id}
            className={`feat-row feat-row--${i === 0 ? "first" : i === mainFeatures.length - 1 ? "last" : "mid"}`}
            ref={(el) => (rowRefs.current[i] = el)}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            {/* red left bar */}
            <div className="feat-accent-bar" />

            <div className="feat-num">{feat.id}</div>

            <div className="feat-content">
              <div className="feat-left">
                <span className="feat-icon">{feat.icon}</span>
                <h2 className="feat-title">{feat.title}</h2>
                <p className="feat-desc">{feat.description}</p>
                <p className="feat-detail">{feat.detail}</p>
              </div>

              <div className="feat-right">
                {feat.highlights.map((h, idx) => (
                  <div className="feat-tag" key={idx}>
                    <div className="feat-tag-dot">
                      <CheckIcon />
                    </div>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI SECTION ── */}
      <div className="ai-wrap">
        <div className="section-label">
          <span>AI Image Enhancement Suite</span>
          <div className="section-label-line" />
        </div>

        <div className="section-head">
          <h2>8 AI-Powered Tools, One Platform</h2>
          <p>Every image enhancement you need, powered by machine intelligence</p>
        </div>

        <div className="ai-grid">
          {aiFeatures.map((feat, i) => (
            <div
              key={i}
              className={`ai-card ai-card--${i}`}
              ref={(el) => (cardRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <span className="ai-card-icon">{feat.icon}</span>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="cta-wrap">
        <div className="cta-inner">
          <h2>Ready to Transform Your Media?</h2>
          <p>Start using all features for free today</p>
          <button className="cta-btn" onClick={() => navigate("/studio")}>
            Open Studio <span className="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;