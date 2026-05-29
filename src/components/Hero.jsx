import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import RenaissanceOrb from './RenaissanceOrb';
import InteractiveAsciiBg from './InteractiveAsciiBg';

export default function Hero() {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const ruleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollRef = useRef(null);
  const socialsRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    // Split name into individual letters
    if (nameRef.current) {
      const lines = nameRef.current.querySelectorAll('.hero__name-line');
      lines.forEach((line, lineIdx) => {
        const text = line.textContent;
        line.innerHTML = '';
        text.split('').forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          line.appendChild(span);
        });

        tl.to(line.querySelectorAll('span'), {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power4.out',
          startAt: { y: 100 },
        }, lineIdx === 0 ? 0.2 : 0.45);
      });
    }

    tl.to(ruleRef.current, { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.65);
    tl.to(subtitleRef.current, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.7);
    tl.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.9);

    if (socialsRef.current) {
      tl.to(socialsRef.current.querySelectorAll('a'), {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        startAt: { y: 20 },
      }, 0.8);
    }

    tl.to(scrollRef.current, { opacity: 1, duration: 0.6 }, 1.2);

    // Mouse parallax on hero text
    const onMove = (e) => {
      if (!sectionRef.current) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(nameRef.current, { x: -nx * 15, y: -ny * 8, duration: 0.6, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__social" ref={socialsRef}>
        <a href="https://linkedin.com/in/royce-antony" target="_blank" rel="noopener noreferrer" style={{ opacity: 0 }}>LinkedIn</a>
        <a href="https://github.com/royceantony9" target="_blank" rel="noopener noreferrer" style={{ opacity: 0 }}>GitHub</a>
        <a href="mailto:antonyroyce2@gmail.com" style={{ opacity: 0 }}>Email</a>
      </div>

      <div className="hero__text">
        <div className="hero__name" ref={nameRef}>
          <div className="hero__name-line">ROYCE</div>
          <div className="hero__name-line">ANTONY</div>
        </div>
        <div className="hero__rule" ref={ruleRef} style={{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }} />
        <p className="hero__subtitle" ref={subtitleRef} style={{ opacity: 0, transform: 'translateX(-40px)' }}>
          Computer Science · AI Specialist · Builder · Mumbai
        </p>
        <div className="hero__cta" ref={ctaRef} style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <a href="#contact" className="pill-btn pill-btn--cta">
            Available for Opportunities
            <span style={{ fontSize: '1.1em' }}>↗</span>
          </a>
        </div>
      </div>

      <div className="hero__canvas" style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', overflow: 'hidden' }}>
        <InteractiveAsciiBg imageSrc="/src/assets/star.png" offsetX={12} />
      </div>

      <div className="scroll-indicator" ref={scrollRef}>
        <div className="scroll-indicator__chevron" />
        <span>SCROLL</span>
      </div>
    </section>
  );
}
