import { useState } from 'react';
import { skillsTechnical, skillsBusiness, certifications, accolades } from '../data';
import ThreeDGallery from './ThreeDGallery';

const carouselItems = [
  {
    localSrc: '/images/carousel/bhojanam.jpg',
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
    title: 'Bhojanam Ayurvedic Platform',
    desc: 'Co-Founded an AI-driven wellness platform, implementing custom NLP systems for Prakruti analyses.',
    tag: 'Co-Founder & Lead Developer',
  },
  {
    localSrc: '/images/carousel/news.jpg',
    src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    title: 'Daily News Highlights Summarizer',
    desc: 'Engineered a production-ready AI news summarization platform, dropping API load times by 60%.',
    tag: 'AI Specialist Intern @ BestOfMine',
  },
  {
    localSrc: '/images/carousel/hackathon.jpg',
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    title: 'Google Bit & Build Hackathon MVP',
    desc: 'Designed and deployed an interactive product dashboard as an international finalist at Google’s hackathon.',
    tag: 'International Finalist',
  },
  {
    localSrc: '/images/carousel/nurture.jpg',
    src: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
    title: 'Nurture Aerospace UAV Systems',
    desc: 'Leading business development and strategic outreach for high-tech robotics and industrial drone solutions.',
    tag: 'Business Development Intern',
  },
  {
    localSrc: '/images/carousel/rotaract.jpg',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    title: 'Rotaract Club PR Initiatives',
    desc: 'Crafting high-engagement campaigns and managing professional branding pipelines to increase visibility.',
    tag: 'Public Relations Director',
  },
];

const mappedReels = carouselItems.map((item) => ({
  image: {
    src: item.src,
    alt: item.title,
  },
  date: item.tag,
  title: item.title,
  description: item.desc,
}));

function MarqueeRow({ items, direction }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee-row marquee-row--${direction}`}>
      {doubled.map((item, i) => (
        <span className="tag" key={i}>{item}</span>
      ))}
    </div>
  );
}

export default function SkillsAccolades() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMilestone = carouselItems[activeIndex] || carouselItems[0];

  return (
    <section id="skills">
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section__label">04 / SKILLS & ACCOLADES</div>
        <h2 className="section__heading" style={{ marginBottom: 0 }}>Skills & Recognition</h2>
      </div>

      {/* Skills Marquees */}
      <div className="marquee-section">
        <MarqueeRow items={skillsTechnical} direction="left" />
        <MarqueeRow items={skillsBusiness} direction="right" />
      </div>

      {/* Main Split Content */}
      <div className="skills-split-container">
        
        {/* Left Side: Certs & Accolades */}
        <div className="skills-left-col">
          <div className="subsection-wrapper">
            <h3 className="skills-subheading">Certifications & Credentials</h3>
            <div className="cert-grid">
              {certifications.map((c) => (
                <span className="cert-pill" key={c}>{c}</span>
              ))}
            </div>
          </div>

          <div className="subsection-wrapper" style={{ marginTop: '3.5rem' }}>
            <h3 className="skills-subheading">National & International Awards</h3>
            <div className="skills-accolades-stack">
              {accolades.map((a, i) => (
                <div
                  className={`accolade-card ${a.featured ? 'accolade-card--featured' : 'accolade-card--standard'}`}
                  key={i}
                >
                  <h4 className="accolade-card__title">{a.title}</h4>
                  <p className="accolade-card__body">{a.body}</p>
                  <span className="accolade-card__tag">{a.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cinematic 3D Dock Carousel */}
        <div className="skills-right-col">
          <h3 className="skills-subheading" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Milestone Showcase
          </h3>
          
          <div className="carousel-view-wrapper" style={{ height: '320px', marginBottom: '1rem' }}>
            <ThreeDGallery
              reels={mappedReels}
              autoPlaySpeed={5000}
              pauseOnHover={true}
              borderRadius={24}
              onActiveIndexChange={(index) => setActiveIndex(index)}
            />
          </div>

          {/* Dynamic Console / Captions Card */}
          <div className="milestone-console" style={{ marginTop: '1.5rem' }}>
            <div className="console-header">
              <span className="console-tag">{activeMilestone.tag}</span>
              <span className="console-counter">
                [ 0{activeIndex + 1} / 0{carouselItems.length} ]
              </span>
            </div>
            <div className="console-body">
              <h4 className="console-title">{activeMilestone.title}</h4>
              <p className="console-desc">{activeMilestone.desc}</p>
            </div>
            <div className="console-footer-glow" />
          </div>
          
          <div className="carousel-instruction" style={{ marginTop: '1rem' }}>
            ✦ Hover dock to spread thumbnails · Click to select image
          </div>
        </div>

      </div>
    </section>
  );
}
