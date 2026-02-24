import React, { useEffect, useState } from "react";
import "../styles/Features.css";

const Features = () => {
  const [visibleItems, setVisibleItems] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const featureItems = document.querySelectorAll(".feature-item");
      featureItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          setVisibleItems((prev) => ({ ...prev, [index]: true }));
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      number: "01",
      title: "Video Compress & Enhance",
      description:
        "Reduce file size without compromising quality. Enhance clarity, resolution, and optimize videos for any platform instantly.",
    },
    {
      number: "02",
      title: "AI Image Enhancement",
      description:
        "Boost image quality, sharpen details, upscale resolution, and restore clarity using advanced AI-powered enhancement.",
    },
    {
      number: "03",
      title: "Smart Format Conversion",
      description:
        "Convert videos, images, and documents into multiple formats with lightning-fast processing and zero quality loss.",
    },
    {
      number: "04",
      title: "Instant PPT Generator",
      description:
        "Automatically generate professional PowerPoint presentations from content, images, or structured data in seconds.",
    },
  ];

  return (
    <section className="features-showcase" id="features">
      <div className="section-title">
        <h2>All-In-One Creative Engine</h2>
        <p>
          Compress, enhance, convert & generate — everything powered by
          intelligent automation.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-item ${
              visibleItems[index] ? "visible" : ""
            }`}
          >
            <div className="feature-number">{feature.number}</div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;