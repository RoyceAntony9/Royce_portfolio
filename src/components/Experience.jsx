import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experiences } from '../data';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Desktop/Tablet Stacked Deck -> Side-by-Side Transition (min-width: 992px)
    mm.add('(min-width: 992px)', () => {
      // 1. Set initial states of cards
      // Card 0 (bottom) starts in the absolute center
      gsap.set(cardsRef.current[0], {
        x: 0,
        y: 0,
        scale: 1,
        zIndex: 10,
        position: 'absolute',
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -40, // Shifted slightly higher to prevent bottom cutoff
        opacity: 1,
      });

      // Card 1 (top) starts vertically below the screen
      gsap.set(cardsRef.current[1], {
        x: 0,
        y: '75vh', // Adjusted start position for smoother entry
        scale: 0.96,
        zIndex: 20,
        position: 'absolute',
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -40, // Shifted slightly higher
        opacity: 0,
      });

      // 2. Timeline with ScrollTrigger pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=260%', // Extended scroll time for smooth reading
          pin: true,
          scrub: 1.2, // Butter-smooth scroll lag
          anticipatePin: 1,
        },
      });

      // Part 0: Empty scroll window at start to read Card 0 alone (BD Intern)
      tl.to({}, { duration: 0.8 });

      // Part 1: Slide Card 1 up, landing directly on top of Card 0 (stacked deck)
      tl.to(cardsRef.current[1], {
        y: 12,
        x: 12,
        scale: 0.98,
        opacity: 1,
        duration: 1.5, // Increased duration for a smoother transition
        ease: 'power2.out',
      });

      // Part 1.5: Reading window for the stacked deck
      tl.to({}, { duration: 1.0 });

      // Part 2: Transition cards side-by-side and slide DOWN to prevent header overlap
      tl.to(cardsRef.current[0], {
        x: '-55%',
        y: '50px', // Perfectly clears header and avoids bottom screen clipping
        xPercent: -50,
        yPercent: -40, // Less aggressive vertical offset
        duration: 1.5,
        ease: 'power3.inOut',
      }, 'sideBySide');

      tl.to(cardsRef.current[1], {
        x: '55%',
        y: '50px', // Perfectly clears header and avoids bottom screen clipping
        xPercent: -50,
        yPercent: -40, // Less aggressive vertical offset
        scale: 1,
        duration: 1.5,
        ease: 'power3.inOut',
      }, 'sideBySide');
    });

    // Mobile fallback: clean vertical scroll fades (max-width: 991px)
    mm.add('(max-width: 991px)', () => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        
        // Reset properties from absolute desktop overrides
        gsap.set(card, {
          clearProps: 'all',
        });

        gsap.fromTo(card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="section experience-pin-section" ref={containerRef} id="experience">
      <div className="section__label">02 / EXPERIENCE</div>
      <h2 className="section__heading">Experience</h2>
      <div className="experience-deck-wrapper">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="exp-card exp-card--deck"
            ref={(el) => (cardsRef.current[i] = el)}
          >
            <div className="exp-card__index">{exp.index}</div>
            <h3 className="exp-card__role">{exp.role}</h3>
            <p className="exp-card__meta">{exp.company} / {exp.period}</p>
            <ul className="exp-card__bullets">
              {exp.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
            <div className="exp-card__tags">
              {exp.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
