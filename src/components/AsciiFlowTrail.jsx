import { useRef, useEffect } from 'react';

export default function AsciiFlowTrail({
  style = {},
  // Glyph & Dithering
  glyphSet = 3,
  scale = 24,
  gamma = 0,
  mix = 100,
  invertOrder = true,
  monochrome = true,
  blendMode = 'Normal',
  // Drawing
  radius = 20,
  strength = 82,
  turbulence = 100,
  tint = '#2D35C8',
  colorMix = 100,
  tailLength = 100,
  drawBlendMode = 'Screen',
  // Interactivity
  trackMouse = 100,
  momentum = 42,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef();
  const mousePos = useRef({ x: -9999, y: -9999 });
  const smoothPos = useRef({ x: -9999, y: -9999 });
  const trail = useRef([]);
  const time = useRef(0);
  const initialized = useRef(false);
  const blueRects = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!initialized.current) {
        mousePos.current = { x: rect.width / 2, y: rect.height / 2 };
        smoothPos.current = { x: rect.width / 2, y: rect.height / 2 };
        initialized.current = true;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse tracking
    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener('mousemove', handleMouse);

    // Character sets
    let baseChars = '@%#*+=-:. ';
    switch (glyphSet) {
      case 0: baseChars = '●•·. '; break;
      case 1: baseChars = '■□▪▫ '; break;
      case 2: baseChars = '█▓▒░ '; break;
      case 3: baseChars = '▣▤▥▦▧▨▩ '; break;
      case 4: baseChars = '◆◇◈○◉◊◌ '; break;
      default: baseChars = '@%#*+=-:. ';
    }

    const chars = invertOrder
      ? baseChars.split('').reverse().join('')
      : baseChars;

    // Parse tint color
    let tintR = 45, tintG = 53, tintB = 200;
    if (typeof tint === 'string' && tint.startsWith('#')) {
      tintR = parseInt(tint.slice(1, 3), 16);
      tintG = parseInt(tint.slice(3, 5), 16);
      tintB = parseInt(tint.slice(5, 7), 16);
    }

    // Animation loop
    const animate = () => {
      time.current += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamically fetch blue regions
      const rects = [];
      const footer = document.querySelector('.footer');
      if (footer) {
        rects.push(footer.getBoundingClientRect());
      }
      const ctaCard = document.querySelector('.project-card--cta');
      if (ctaCard) {
        rects.push(ctaCard.getBoundingClientRect());
      }
      blueRects.current = rects;

      // Dynamically calculate 3D Orb position and size for occlusion mask
      let orbCenter = null;
      let orbRadius = 0;
      const orbCanvas = document.querySelector('.hero__canvas');
      if (orbCanvas) {
        const rect = orbCanvas.getBoundingClientRect();
        orbCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        // Orb scale is about 35% of container height/width
        orbRadius = Math.min(rect.width, rect.height) * 0.35;
      }

      // Target position
      let targetX = mousePos.current.x;
      let targetY = mousePos.current.y;

      if (trackMouse < 100) {
        const autoX = canvas.width / 2 + Math.sin(time.current) * 150;
        const autoY = canvas.height / 2 + Math.cos(time.current * 0.7) * 150;
        const trackFactor = trackMouse / 100;
        targetX = mousePos.current.x * trackFactor + autoX * (1 - trackFactor);
        targetY = mousePos.current.y * trackFactor + autoY * (1 - trackFactor);
      }

      // Apply momentum
      const momentumFactor = 1 - (momentum / 100) * 0.95;
      smoothPos.current.x += (targetX - smoothPos.current.x) * momentumFactor;
      smoothPos.current.y += (targetY - smoothPos.current.y) * momentumFactor;

      // Check if mouse is inside the .hero__canvas bounding rect
      let isInsideOrbRegion = false;
      if (orbCanvas) {
        const rect = orbCanvas.getBoundingClientRect();
        const mx = mousePos.current.x;
        const my = mousePos.current.y;
        if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
          isInsideOrbRegion = true;
        }
      }

      // Add to trail only if outside the orb/canvas region
      if (!isInsideOrbRegion) {
        trail.current.push({
          x: smoothPos.current.x,
          y: smoothPos.current.y,
          life: 1.0,
        });
      } else {
        // Rapidly decay existing trail particles to make it disappear instantly in this region
        trail.current.forEach((p) => (p.life -= 0.18));
      }

      // Manage trail
      const maxLength = Math.floor((tailLength / 100) * 50) + 5;
      while (trail.current.length > maxLength) {
        trail.current.shift();
      }

      const decay = 0.02 * (1 - tailLength / 100) + 0.01;
      trail.current.forEach((p) => (p.life -= decay));
      trail.current = trail.current.filter((p) => p.life > 0);

      // Character size
      const charSize = Math.max(6, Math.floor((16 * scale) / 100));
      ctx.font = `${charSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Blend mode
      if (blendMode === 'Add') ctx.globalCompositeOperation = 'lighter';
      else if (blendMode === 'Screen') ctx.globalCompositeOperation = 'screen';
      else if (blendMode === 'Multiply') ctx.globalCompositeOperation = 'multiply';
      else if (blendMode === 'Difference') ctx.globalCompositeOperation = 'difference';
      else ctx.globalCompositeOperation = 'source-over';

      // Draw grid
      const cols = Math.ceil(canvas.width / charSize);
      const rows = Math.ceil(canvas.height / charSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * charSize + charSize / 2;
          const y = row * charSize + charSize / 2;

          // 3D Orb Occlusion Check
          if (orbCenter) {
            const distToOrb = Math.sqrt(
              Math.pow(x - orbCenter.x, 2) + Math.pow(y - orbCenter.y, 2)
            );
            if (distToOrb < orbRadius) {
              continue; // Skip rendering: hides behind the shiny orb!
            }
          }

          let intensity = 0;

          trail.current.forEach((point) => {
            const dist = Math.sqrt(
              Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );
            const maxDist = (radius / 100) * 150;
            if (dist < maxDist) {
              const value = (1 - dist / maxDist) * point.life * (strength / 100);

              if (drawBlendMode === 'Add') intensity += value;
              else if (drawBlendMode === 'Multiply') intensity = intensity * value;
              else if (drawBlendMode === 'Difference') intensity = Math.abs(intensity - value);
              else if (drawBlendMode === 'Screen') intensity = 1 - (1 - intensity) * (1 - value);
              else intensity = Math.max(intensity, value);
            }
          });

          // Turbulence
          if (turbulence > 0 && intensity > 0) {
            const turb =
              Math.sin(x * 0.01 + time.current) *
              Math.cos(y * 0.01 + time.current * 0.7) *
              (turbulence / 1000);
            intensity += turb;
          }

          // Gamma
          if (gamma !== 0 && intensity > 0) {
            intensity = Math.pow(intensity, 1 - gamma);
          }

          // Dithering
          if (glyphSet > 0 && intensity > 0) {
            const ditherAmount = 0.2;
            if (glyphSet === 1) {
              intensity += (Math.sin(col * 0.5) + Math.cos(row * 0.5)) * ditherAmount;
            } else if (glyphSet === 2) {
              intensity += ((col % 2) + (row % 2)) * ditherAmount - ditherAmount;
            } else if (glyphSet === 3) {
              const bayer = [
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5],
              ];
              const threshold = bayer[row % 4][col % 4] / 16;
              intensity = intensity > threshold ? 1 : intensity * 0.5;
            } else if (glyphSet === 4 || glyphSet === 5) {
              intensity += Math.random() * ditherAmount - ditherAmount / 2;
            }
          }

          intensity = Math.max(0, Math.min(1, intensity));

          if (intensity > 0.01) {
            const charIndex = Math.min(
              chars.length - 1,
              Math.floor(intensity * chars.length)
            );
            const char = chars[charIndex];
            const alpha = intensity * (mix / 100);

            // Dynamic color switch for blue background overlap
            let isOverBlue = false;
            for (let i = 0; i < blueRects.current.length; i++) {
              const r = blueRects.current[i];
              if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                isOverBlue = true;
                break;
              }
            }

            if (isOverBlue) {
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`; // soft high contrast white
            } else {
              if (monochrome) {
                ctx.fillStyle = `rgba(${tintR}, ${tintG}, ${tintB}, ${alpha})`;
              } else {
                const mixFactor = colorMix / 100;
                const brightness = intensity;
                const r = Math.round(255 * brightness * (1 - mixFactor) + tintR * mixFactor * brightness);
                const g = Math.round(255 * brightness * (1 - mixFactor) + tintG * mixFactor * brightness);
                const b = Math.round(255 * brightness * (1 - mixFactor) + tintB * mixFactor * brightness);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
              }
            }

            ctx.fillText(char, x, y);
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouse);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [
    glyphSet, scale, gamma, mix, invertOrder, monochrome, blendMode,
    radius, strength, turbulence, tint, colorMix, tailLength, drawBlendMode,
    trackMouse, momentum,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
