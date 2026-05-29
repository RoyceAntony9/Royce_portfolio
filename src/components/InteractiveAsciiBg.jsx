import { useEffect, useRef, useState } from 'react';

const ASCII_CHARS = '@%#*+=-:. ';

export default function InteractiveAsciiBg(props) {
  const {
    imageSrc = '/src/assets/ascii-bg.png',
    density = 55, // lowered to make cells/spacing larger
    fontSize = 15, // increased for larger, more readable characters
    exposure = 15,
    contrast = 20,
    shadows = 0,
    textColor = '#2D35C8', // Electric Cobalt Blue
    bgColor = 'transparent',
    asciiFontWeight = 400,
    glyphDrift = true,
    glowyText = true,
    customChars = '',
    offsetX = 0,
    offsetY = 0,
  } = props;

  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const [loaded, setLoaded] = useState(false);

  const activeChars = customChars || ASCII_CHARS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let particles = [];
    let isComponentActive = true;

    // Handle Resize
    const resizeCanvas = () => {
      const rect = canvas.parentElement 
        ? canvas.parentElement.getBoundingClientRect() 
        : { width: window.innerWidth, height: window.innerHeight };
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track Mouse mapped to local canvas coordinates
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Process Image and Initialize Particles
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;

    img.onload = () => {
      if (!isComponentActive) return;

      // Offscreen canvas to sample the image
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      
      // Mono character height to width aspect correction
      const charAspect = 1.6; 
      const cols = Math.round(density);
      const rows = Math.round(cols * (canvas.height / canvas.width) * charAspect);

      offCanvas.width = cols;
      offCanvas.height = rows;

      // Draw the image centered and scaled aspect-fill on the offscreen canvas
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = cols / rows;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = rows;
        drawW = rows * imgAspect;
        drawX = (cols - drawW) / 2 + offsetX;
        drawY = offsetY;
      } else {
        drawW = cols;
        drawH = cols / imgAspect;
        drawX = offsetX;
        drawY = (rows - drawH) / 2 + offsetY;
      }

      offCtx.drawImage(img, drawX, drawY, drawW, drawH);
      const imgData = offCtx.getImageData(0, 0, cols, rows);
      const data = imgData.data;

      // Generate Particles
      particles = [];
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          let r = data[idx];
          let g = data[idx + 1];
          let b = data[idx + 2];

          // Apply exposure / contrast adjustments
          r += exposure;
          g += exposure;
          b += exposure;
          
          if (contrast !== 0) {
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;
          }

          // Calculate average brightness
          const brightness = Math.max(0, Math.min(255, 0.2126 * r + 0.7152 * g + 0.0722 * b));
          
          // Map to character Index (invert because white is high brightness, we want darker outline drawn)
          const charIdx = Math.floor(((255 - brightness) / 255) * (activeChars.length - 1));
          const char = activeChars[charIdx];

          // Skip drawing space and extremely faint characters to optimize particles
          if (!char || char === ' ' || charIdx <= 1) continue;

          const homeX = x * cellW + cellW / 2;
          const homeY = y * cellH + cellH / 2;

          particles.push({
            char,
            originalChar: char,
            brightness,
            x: homeX,
            y: homeY,
            homeX,
            homeY,
            vx: 0,
            vy: 0,
            seed: Math.random() * 1000,
          });
        }
      }

      particlesRef.current = particles;
      setLoaded(true);
    };

    // Animation Loop
    let tick = 0;
    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const repulsionRadius = 110; // Influence circle
      const springStiffness = 0.045; // Smooth spring snap
      const pushStrength = 3.5; // Visual push distance
      const damping = 0.84; // Drift damping

      // Set Font once using dynamic fontSize
      ctx.font = `${asciiFontWeight} ${fontSize}px SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (glowyText) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = textColor;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = textColor;

      const len = particlesRef.current.length;
      for (let i = 0; i < len; i++) {
        const p = particlesRef.current[i];

        // 1. Mouse Repulsion Wave
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repulsionRadius) {
          const force = (repulsionRadius - dist) / repulsionRadius;
          const angle = Math.atan2(dy, dx);
          // Apply repulsion force away from cursor
          const acceleration = force * pushStrength;
          p.vx += Math.cos(angle) * acceleration;
          p.vy += Math.sin(angle) * acceleration;
        }

        // 2. Spring Back Force
        p.vx += (p.homeX - p.x) * springStiffness;
        p.vy += (p.homeY - p.y) * springStiffness;

        // 3. Friction
        p.vx *= damping;
        p.vy *= damping;

        // 4. Update coordinates
        p.x += p.vx;
        p.y += p.vy;

        // 5. Glyph Drift logic
        if (glyphDrift && tick % 45 === 0 && Math.random() < 0.05) {
          // Subtly shuffle characters in brightness-related bin for natural shimmer
          const baseIdx = Math.floor(((255 - p.brightness) / 255) * (activeChars.length - 1));
          const driftOffset = Math.random() < 0.5 ? -1 : 1;
          const newIdx = Math.max(0, Math.min(activeChars.length - 1, baseIdx + driftOffset));
          p.char = activeChars[newIdx];
        }

        // 6. Canvas Paint Character
        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (loaded) {
      animate();
    } else {
      // Just check load state
      const checkInterval = setInterval(() => {
        if (particlesRef.current.length > 0) {
          clearInterval(checkInterval);
          animate();
        }
      }, 50);
      return () => {
        clearInterval(checkInterval);
        isComponentActive = false;
      };
    }

    return () => {
      isComponentActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [loaded, imageSrc, density, fontSize, exposure, contrast, shadows, textColor, asciiFontWeight, glyphDrift, glowyText, customChars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.24, // perfectly visible royal background
        background: bgColor,
      }}
    />
  );
}
