import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import SkillsAccolades from './components/SkillsAccolades';
import Footer from './components/Footer';
import AsciiFlowTrail from './components/AsciiFlowTrail';
import InteractiveAsciiBg from './components/InteractiveAsciiBg';

export default function App() {
  return (
    <>
      <CustomCursor />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998, opacity: 0.18 }}>
        <AsciiFlowTrail />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Experience />
        <Projects />
        <SkillsAccolades />
        <Footer />
      </div>
    </>
  );
}
