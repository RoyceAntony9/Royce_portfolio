import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const triggerRef = useRef(null);
  const stickyRef = useRef(null);
  const stripRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const strip = stripRef.current;

    const ctx = gsap.context(() => {
      gsap.to(strip, {
        x: () => -(strip.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2, // Match the butter-smooth scroll lag of experience
          pin: stickyRef.current,
          invalidateOnRefresh: true, // Crucial for recalculation on resize or load
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.width = `${self.progress * 100}%`;
            }
          },
        },
      });
    });

    // Refresh ScrollTrigger once everything is painted and assets are loaded
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);

    // Dynamic timeout refresh to handle React's initial DOM paint latency
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="projects">
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section__label">03 / PROJECTS</div>
        <h2 className="section__heading">Selected Projects</h2>
      </div>

      <div className="projects-trigger" ref={triggerRef} style={{ height: '400vh' }}>
        <div className="projects-sticky" ref={stickyRef}>
          <div className="projects-strip" ref={stripRef}>
            {projects.map((proj, i) => (
              <div className="project-card" key={i}>
                <div className="project-card__inner">
                  <div className="project-card__tag">{proj.tag}</div>
                  <h3 className="project-card__title">{proj.title}</h3>
                  <p className="project-card__role">{proj.role}</p>
                  <p className="project-card__desc">{proj.description}</p>
                  <div className="project-card__stack">
                    {proj.stack.map((s) => (
                      <span className="tag" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* CTA End Card */}
            <div className="project-card project-card--cta">
              <div className="project-card__inner">
                <h3 className="project-card__title">Let's Build Something.</h3>
                <p className="project-card__role" style={{ marginBottom: '2rem' }}>
                  Open to PM, AI, and BD opportunities.
                </p>
                <a href="#contact" className="pill-btn pill-btn--cta-inverted">
                  Get in Touch <span>↓</span>
                </a>
              </div>
            </div>
          </div>

          <div className="projects-progress">
            <div className="projects-progress__bar" ref={progressRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
