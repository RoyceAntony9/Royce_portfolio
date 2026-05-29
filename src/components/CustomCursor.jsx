import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const onMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08 });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.18 });
    };

    const addHover = () => {
      ring.classList.add('hovering');
      dot.classList.add('hovering');
    };
    const removeHover = () => {
      ring.classList.remove('hovering');
      dot.classList.remove('hovering');
    };

    window.addEventListener('mousemove', onMove);

    const attachHoverListeners = () => {
      document.querySelectorAll('a, button, .pill-btn, .tag, .project-card__inner').forEach((el) => {
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
      });
    };

    attachHoverListeners();
    const observer = new MutationObserver(attachHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
