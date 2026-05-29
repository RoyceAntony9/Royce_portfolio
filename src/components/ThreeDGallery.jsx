import React, { useState, useEffect, useRef, startTransition, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Local high-fidelity mock of Framer Store & Shaders to ensure zero bundler/Vite HTTPS loading crashes
const createStore = (initialState) => {
  return () => {
    const [store, setStoreState] = useState(initialState);
    const setStore = (newVal) => setStoreState(prev => ({ ...prev, ...newVal }));
    return [store, setStore];
  };
};

const randomColor = () => {
  const colors = ["#2D35C8", "#3B47E0", "#00E5CC", "#3D9EFF", "#C96CFF"];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ==========================================
// USER'S FRAMER OVERRIDES (EXACTLY AS SENT)
// ==========================================

const useStore = createStore({
    background: "#0099FF",
})

export function withRotate(Component) {
    return forwardRef((props, ref) => {
        return (
            <Component
                ref={ref}
                {...props}
                animate={{ rotate: 90 }}
                transition={{ duration: 2 }}
            />
        )
    })
}

export function withHover(Component) {
    return forwardRef((props, ref) => {
        return <Component ref={ref} {...props} whileHover={{ scale: 1.05 }} />
    })
}

export function withRandomColor(Component) {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                animate={{
                    background: store.background,
                }}
                onClick={() => {
                    setStore({ background: randomColor() })
                }}
            />
        )
    })
}

// ==========================================
// 3D DOCK CAROUSEL DEFAULT EXPORT
// ==========================================

const ImageWithFallback = ({ localSrc, fallbackSrc, alt, style, className }) => {
  const [imgSrc, setImgSrc] = useState(localSrc);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setImgSrc(localSrc);
    setHasFailed(false);
  }, [localSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      className={className}
      onError={() => {
        if (!hasFailed) {
          setHasFailed(true);
          setImgSrc(fallbackSrc);
        }
      }}
      draggable={false}
    />
  );
};

export default function ThreeDGallery(props) {
  const {
    reels = [],
    autoPlaySpeed = 6000,
    pauseOnHover = true,
    borderRadius = 24, // thick curved corners for high fidelity
    padding = 24,
    style,
    onActiveIndexChange,
  } = props;

  const [currentReel, setCurrentReel] = useState(0);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const [hoveredThumbIndex, setHoveredThumbIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);

  const total = reels.length;

  // Auto-play interval for progressive timeline
  useEffect(() => {
    if (isPaused || isDockHovered) {
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
      return;
    }

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentReel((r) => (r + 1) % total);
          return 0;
        }
        return prev + 100 / (autoPlaySpeed / 16);
      });
    }, 16);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPaused, isDockHovered, autoPlaySpeed, total]);

  // Sync index change to parent highlights card
  useEffect(() => {
    if (onActiveIndexChange) {
      onActiveIndexChange(currentReel);
    }
  }, [currentReel, onActiveIndexChange]);

  const selectReel = (idx) => {
    startTransition(() => {
      setCurrentReel(idx);
      setProgress(0);
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentReel((prev) => (prev - 1 + total) % total);
        setProgress(0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentReel((prev) => (prev + 1) % total);
        setProgress(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [total]);

  // Main local image path resolver
  let mainLocalSrc = null;
  if (currentReel === 0) mainLocalSrc = '/images/carousel/bhojanam.jpg';
  else if (currentReel === 1) mainLocalSrc = '/images/carousel/news.jpg';
  else if (currentReel === 2) mainLocalSrc = '/images/carousel/hackathon.jpg';
  else if (currentReel === 3) mainLocalSrc = '/images/carousel/nurture.jpg';
  else if (currentReel === 4) mainLocalSrc = '/images/carousel/rotaract.jpg';

  return (
    <div
      style={{
        ...style,
        position: "relative",
        overflow: "visible", // allows fanned dock to extend outside bottom bounds
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: "45px", // adds buffer space for fanned dock at bottom
      }}
      onMouseEnter={() => { if (pauseOnHover) setIsPaused(true); }}
      onMouseLeave={() => { setIsPaused(false); }}
    >
      {/* 1. MAIN DISPLAY CARD */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "470px",
          height: "270px",
          borderRadius: `${borderRadius}px`,
          border: "4px solid #ffffff", // premium thick white stroke
          background: "#0c0f24",
          boxShadow: "0 20px 48px rgba(12, 15, 36, 0.16), 0 4px 12px rgba(45, 53, 200, 0.08)",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReel}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ImageWithFallback
              localSrc={mainLocalSrc}
              fallbackSrc={reels[currentReel]?.image?.src}
              alt={reels[currentReel]?.image?.alt || "Selected image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Soft background dark gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(12, 15, 36, 0.65) 0%, rgba(12, 15, 36, 0.05) 50%, transparent 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Small Progressive Auto-Play Loader Bar on top boundary */}
        {!isDockHovered && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${progress}%`,
              height: "3px",
              background: "#2D35C8", // cobalt blue
              transition: "none",
            }}
          />
        )}
      </div>

      {/* 2. INTERACTIVE 3D DECK/DOCK BOTTOM BAR */}
      <div
        style={{
          position: "absolute",
          bottom: "10px", // overlaps the bottom border of the main card beautifully
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 5,
          pointerEvents: "auto",
        }}
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => {
          setIsDockHovered(false);
          setHoveredThumbIndex(null);
        }}
      >
        {reels.map((item, i) => {
          const isActive = i === currentReel;
          const isCurrentHovered = i === hoveredThumbIndex;

          // 3D parameters based on Dock Hover state
          // 1. Margins: overlaps tightly when not hovered, spreads out when hovered
          const margin = isDockHovered ? "8px" : "-16px";
          
          // 2. Rotations: pixel-perfect fanning matching the reference image's progressive tilt
          const rotations = [-11, -7, -3, 4, 9];
          const rotate = isDockHovered ? 0 : rotations[i];

          // 3. Y-translations (Floating curve height):
          // - When hovered on a card, it floats UP by -24px
          // - When not hovered at all, they form a pixel-perfect staggered curve
          const yOffsets = [16, 6, 1, 0, 10];
          let y = 0;
          if (isDockHovered) {
            y = isCurrentHovered ? -24 : 0;
          } else {
            y = yOffsets[i];
          }

          // 4. Scales: zoomed on single hover
          const scale = isCurrentHovered ? 1.25 : 1;

          // Thumbnail local image path mapper
          let thumbLocalSrc = null;
          if (i === 0) thumbLocalSrc = '/images/carousel/bhojanam.jpg';
          else if (i === 1) thumbLocalSrc = '/images/carousel/news.jpg';
          else if (i === 2) thumbLocalSrc = '/images/carousel/hackathon.jpg';
          else if (i === 3) thumbLocalSrc = '/images/carousel/nurture.jpg';
          else if (i === 4) thumbLocalSrc = '/images/carousel/rotaract.jpg';

          return (
            <motion.div
              key={i}
              onClick={() => selectReel(i)}
              onMouseEnter={() => setHoveredThumbIndex(i)}
              onMouseLeave={() => setHoveredThumbIndex(null)}
              animate={{
                x: 0,
                y,
                rotate,
                scale,
                marginLeft: margin,
                marginRight: margin,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
                mass: 0.8,
              }}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px", // perfect iOS-style squircle corner radius
                border: "3px solid #ffffff", // clean solid white border for all cards, no blue border when selected
                boxShadow: isActive 
                  ? "0 8px 24px rgba(0, 0, 0, 0.35)" 
                  : "0 6px 16px rgba(0, 0, 0, 0.15)",
                overflow: "hidden",
                cursor: "pointer",
                background: "#0c0f24",
                flexShrink: 0,
                transformOrigin: "bottom center",
                zIndex: isCurrentHovered ? 100 : 10 + i, // right-to-left stacking (each card overlaps the left one)
              }}
            >
              <ImageWithFallback
                localSrc={thumbLocalSrc}
                fallbackSrc={item.image?.src}
                alt={`thumb-${i}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
