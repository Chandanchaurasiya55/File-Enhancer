import { useEffect, useRef, useState } from "react";
import "../styles/MouseMovingEffect.css";

function MouseMovingEffect() {
  const ringRef      = useRef(null);
  const dotRef       = useRef(null);
  const outerRef     = useRef(null);
  const mouse        = useRef({ x: window.innerWidth / 2,  y: window.innerHeight / 2 });
  const ring         = useRef({ x: window.innerWidth / 2,  y: window.innerHeight / 2 });
  const outer        = useRef({ x: window.innerWidth / 2,  y: window.innerHeight / 2 });
  const rafId        = useRef(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      // Check if hovering interactive element
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive = el?.closest("a, button, input, textarea, [data-hover]");
      setHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", onMove);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      // Inner ring — fast follow
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.15);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.15);

      // Outer ring — slow lazy follow
      outer.current.x = lerp(outer.current.x, mouse.current.x, 0.06);
      outer.current.y = lerp(outer.current.y, mouse.current.y, 0.06);

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      if (outerRef.current) {
        outerRef.current.style.transform =
          `translate(${outer.current.x}px, ${outer.current.y}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>

      {/* Exact dot at cursor */}
      <div ref={dotRef}  className={`cursor-dot   ${hovering ? "hovering" : ""}`} />

      {/* Fast following ring */}
      <div ref={ringRef} className={`cursor-ring  ${hovering ? "hovering" : ""}`} />

      {/* Slow outer ring */}
      <div ref={outerRef} className={`cursor-outer ${hovering ? "hovering" : ""}`} />
    </>
  );

}

export default MouseMovingEffect;