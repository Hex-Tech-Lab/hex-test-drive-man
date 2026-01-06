"use client";

import { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { animate } from "animejs";
import { motion } from "framer-motion";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { useLanguageStore } from "@/stores/language-store";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import PsychologyIcon from "@mui/icons-material/Psychology";

/**
 * Liquid Hero component with PixiJS primary animation and Anime.js fallback
 * Grok-inspired fluid motion with sophisticated corporate aesthetic
 */
export default function LiquidHeroHybrid() {
  const [useFallback, setUseFallback] = useState<boolean | null>(null);
  const language = useLanguageStore((state) => state.language);

  // Capability detection (WebGL + basic hardware heuristic)
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    const weakHardware =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      /Android/.test(navigator.userAgent);

    if (!gl || weakHardware) {
      setUseFallback(true);
    } else {
      setUseFallback(false);
    }
  }, []);

  if (useFallback === null) {
    // Initial placeholder to avoid CLS
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {language === "ar" ? "الذكاء السائل" : "Liquid Intelligence"}
        </Typography>
      </Box>
    );
  }

  return useFallback ? <FallbackHero /> : <PixiHero />;
}

/* -----------------------------------
 *  FALLBACK HERO (Anime.js + SVG)
 * ----------------------------------*/

function FallbackHero() {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    // Animate blobs with smooth morphing
    animate("#blob1", {
      d: [
        "M400,300c0,90 -70,140 -140,140c-90,0 -140,-70 -140,-140c0,-90 70,-140 140,-140c90,0 140,70 140,140z",
        "M420,300c0,110 -90,160 -160,160c-110,0 -160,-90 -160,-160c0,-110 90,-160 160,-160c110,0 160,90 160,160z",
        "M400,300c0,90 -70,140 -140,140c-90,0 -140,-70 -140,-140c0,-90 70,-140 140,-140c90,0 140,70 140,140z",
      ],
      duration: 8000,
      ease: "inOut(quad)",
      loop: true,
    });

    animate("#blob2", {
      d: [
        "M550,300c0,80 -60,130 -130,130c-80,0 -130,-60 -130,-130c0,-80 60,-130 130,-130c80,0 130,60 130,130z",
        "M570,300c0,100 -80,150 -150,150c-100,0 -150,-80 -150,-150c0,-100 80,-150 150,-150c100,0 150,80 150,150z",
        "M550,300c0,80 -60,130 -130,130c-80,0 -130,-60 -130,-130c0,-80 60,-130 130,-130c80,0 130,60 130,130z",
      ],
      duration: 9000,
      ease: "inOut(sine)",
      loop: true,
    });

    animate("#blob3", {
      d: [
        "M700,350c0,70 -50,120 -120,120c-70,0 -120,-50 -120,-120c0,-70 50,-120 120,-120c70,0 120,50 120,120z",
        "M720,350c0,90 -70,140 -140,140c-90,0 -140,-70 -140,-140c0,-90 70,-140 140,-140c90,0 140,70 140,140z",
        "M700,350c0,70 -50,120 -120,120c-70,0 -120,-50 -120,-120c0,-70 50,-120 120,-120c70,0 120,50 120,120z",
      ],
      duration: 10000,
      ease: "inOut(cubic)",
      loop: true,
    });

    const svg = document.getElementById("heroSvgFallback");

    function handlePointer(e: PointerEvent | TouchEvent) {
      if (!svg) return;
      const touch = (e as TouchEvent).touches?.[0];
      const clientX =
        (e as PointerEvent).clientX || touch?.clientX || window.innerWidth / 2;
      const clientY =
        (e as PointerEvent).clientY || touch?.clientY || window.innerHeight / 2;

      const x = clientX / window.innerWidth - 0.5;
      const y = clientY / window.innerHeight - 0.5;
      const tx = x * 30;
      const ty = y * 30;
      (svg as HTMLElement).style.transform = `translate(${tx}px, ${ty}px)`;
    }

    window.addEventListener("pointermove", handlePointer as any, {
      passive: true,
    });
    window.addEventListener("touchmove", handlePointer as any, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointer as any);
      window.removeEventListener("touchmove", handlePointer as any);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)",
        color: "rgba(255, 255, 255, 0.95)",
        transition: "all 0.3s ease",
      }}
    >
      <svg
        id="heroSvgFallback"
        style={{
          position: "absolute",
          inset: 0,
          width: "120vw",
          height: "120vh",
          top: "-10vh",
          left: "-10vw",
          opacity: 0.85,
          willChange: "transform",
          transition: "transform 0.15s ease-out",
        }}
        viewBox="0 0 800 600"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 22 -12"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>

          <radialGradient id="grad1" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#2d3561" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0a0e27" stopOpacity="0.3" />
          </radialGradient>

          <radialGradient id="grad2" cx="70%" cy="60%" r="70%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4a5f8f" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a1f3a" stopOpacity="0.3" />
          </radialGradient>

          <radialGradient id="grad3" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#8b95a8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2d3561" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        <g filter="url(#goo)">
          <path
            id="blob1"
            fill="url(#grad1)"
            d="M400,300c0,90 -70,140 -140,140c-90,0 -140,-70 -140,-140c0,-90 70,-140 140,-140c90,0 140,70 140,140z"
          />
          <path
            id="blob2"
            fill="url(#grad2)"
            d="M550,300c0,80 -60,130 -130,130c-80,0 -130,-60 -130,-130c0,-80 60,-130 130,-130c80,0 130,60 130,130z"
          />
          <path
            id="blob3"
            fill="url(#grad3)"
            d="M700,350c0,70 -50,120 -120,120c-70,0 -120,-50 -120,-120c0,-70 50,-120 120,-120c70,0 120,50 120,120z"
          />
        </g>
      </svg>

      <HeroContent />
    </Box>
  );
}

/* -----------------------------------
 *  PIXI HERO (Primary, Grok-style)
 * ----------------------------------*/

function PixiHero() {
  useEffect(() => {
    const containerEl = document.getElementById("pixiContainer");
    if (!containerEl) return;

    const app = new PIXI.Application();
    
    (async () => {
      await app.init({
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      containerEl.appendChild(app.canvas);

      const stageContainer = new PIXI.Container();
      app.stage.addChild(stageContainer);

      const blobs: PIXI.Sprite[] = [];

      function createGradientBlob(radius: number, colors: number[]) {
        const g = new PIXI.Graphics();
        const steps = colors.length;
        for (let i = 0; i < steps; i++) {
          const r = radius * (1 - i / steps);
          const alpha = 1 - i / steps;
          g.circle(0, 0, r);
          g.fill({ color: colors[i], alpha });
        }
        const tex = app.renderer.generateTexture(g);
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        return sprite;
      }

      // Sophisticated color palette: deep jewel tones + metallic accents
      const palette = [
        [0x22d3ee, 0x2d3561, 0x0a0e27], // Cyan to deep blue
        [0xa78bfa, 0x4a5f8f, 0x1a1f3a], // Purple to navy
        [0xd4af37, 0x8b95a8, 0x2d3561], // Gold to slate
        [0x22d3ee, 0x4a5f8f, 0x0f1419], // Cyan to dark
        [0xc0c5d0, 0x2d3561, 0x1a1f3a], // Silver to navy
      ];

      // Create 18 blobs for rich, fluid motion
      for (let i = 0; i < 18; i++) {
        const colors = palette[i % palette.length];
        const blob = createGradientBlob(160 + Math.random() * 80, colors);
        blob.x = window.innerWidth * Math.random();
        blob.y = window.innerHeight * Math.random();
        (blob as any).vx = (Math.random() - 0.5) * 1.2;
        (blob as any).vy = (Math.random() - 0.5) * 1.2;
        (blob as any).baseScale = 0.8 + Math.random() * 0.4;
        blob.scale.set((blob as any).baseScale);
        stageContainer.addChild(blob);
        blobs.push(blob);
      }

      // Enhanced blur for gooey effect
      const blur = new PIXI.BlurFilter();
      blur.blur = 42;
      blur.quality = 4;

      // Custom shader for metallic/glossy effect
      const gooFrag = `
        in vec2 vTextureCoord;
        out vec4 finalColor;
        
        uniform sampler2D uTexture;

        void main() {
          vec4 c = texture(uTexture, vTextureCoord);
          
          // Metallic enhancement
          float a = smoothstep(0.32, 0.58, c.a);
          
          // Add shimmer/highlight
          vec3 enhanced = c.rgb * 1.35;
          enhanced += vec3(0.15, 0.15, 0.2) * a;
          
          finalColor = vec4(enhanced, a);
        }
      `;
      const gooFilter = new PIXI.Filter({
        glProgram: PIXI.GlProgram.from({
          fragment: gooFrag,
          vertex: `
            in vec2 aPosition;
            out vec2 vTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 worldTransformMatrix;
            uniform mat3 localTransformMatrix;
            
            void main() {
              mat3 mvp = projectionMatrix * worldTransformMatrix * localTransformMatrix;
              gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
              vTextureCoord = aPosition;
            }
          `,
        }),
        resources: {},
      });
      stageContainer.filters = [blur, gooFilter];

      let t = 0;
      let pointerX = window.innerWidth / 2;
      let pointerY = window.innerHeight / 2;

      function onPointer(e: PointerEvent) {
        pointerX = e.clientX;
        pointerY = e.clientY;
      }

      window.addEventListener("pointermove", onPointer as any, {
        passive: true,
      });

      app.ticker.add((ticker) => {
        const delta = ticker.deltaTime;
        t += delta * 0.012;

        blobs.forEach((b, i) => {
          const blob: any = b;

          // Base drift (faster than before)
          b.x += blob.vx * delta * 1.5;
          b.y += blob.vy * delta * 1.5;

          // Center gravity (subtle pull to center)
          const cx = window.innerWidth * 0.5;
          const cy = window.innerHeight * 0.52;
          blob.vx += (cx - b.x) * 0.00008 * delta;
          blob.vy += (cy - b.y) * 0.00008 * delta;

          // Aggressive pointer attraction (Grok-style magnetic effect)
          const dx = pointerX - b.x;
          const dy = pointerY - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(1, 300 / (dist + 1));
          blob.vx += dx * 0.00015 * force * delta;
          blob.vy += dy * 0.00015 * force * delta;

          // Scale pulse (dynamic breathing)
          const pulse = 0.08 * Math.sin(t * (0.9 + i * 0.15));
          const targetScale = blob.baseScale + pulse;
          b.scale.set(targetScale);

          // Velocity damping
          blob.vx *= 0.995;
          blob.vy *= 0.995;

          // Soft bounds with bounce
          const margin = 280;
          if (b.x < -margin || b.x > window.innerWidth + margin) {
            blob.vx *= -0.8;
            b.x = Math.max(-margin, Math.min(window.innerWidth + margin, b.x));
          }
          if (b.y < -margin || b.y > window.innerHeight + margin) {
            blob.vy *= -0.8;
            b.y = Math.max(-margin, Math.min(window.innerHeight + margin, b.y));
          }
        });

        // Dynamic blur pulsing
        blur.blur = 38 + 8 * Math.sin(t * 1.5);
      });

      return () => {
        window.removeEventListener("pointermove", onPointer as any);
        app.destroy(true);
      };
    })();
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)",
        color: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <div
        id="pixiContainer"
        style={{
          position: "absolute",
          inset: 0,
          contain: "strict",
        }}
      />
      <HeroContent />
    </Box>
  );
}

/* -----------------------------------
 *  HERO CONTENT (Shared)
 * ----------------------------------*/

function HeroContent() {
  const language = useLanguageStore((state) => state.language);
  const isArabic = language === "ar";

  const content = {
    title: isArabic ? "الذكاء السائل" : "Liquid Intelligence",
    subtitle: isArabic
      ? "منصة حجز تجربة القيادة الأكثر تطوراً في مصر"
      : "Egypt's Most Advanced Test Drive Booking Platform",
    badges: [
      {
        icon: DirectionsCarIcon,
        text: isArabic ? "أكبر مخزون مصري" : "Largest Egyptian Inventory",
      },
      {
        icon: FlashOnIcon,
        text: isArabic ? "حجز فوري" : "Instant Booking",
      },
      {
        icon: PsychologyIcon,
        text: isArabic ? "مطابقة بالذكاء الاصطناعي" : "AI-Powered Matching",
      },
    ],
    ctaPrimary: isArabic ? "استكشف المركبات" : "Explore Vehicles",
    ctaSecondary: isArabic ? "كيف يعمل" : "How It Works",
  };

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
              fontWeight: 800,
              letterSpacing: { xs: "0.15em", md: "0.25em" },
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #ffffff 0%, #c0c5d0 50%, #8b95a8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
              textShadow: "0 0 40px rgba(34, 211, 238, 0.3)",
            }}
          >
            {content.title}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <Typography
            variant="h5"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              mb: 5,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.6,
            }}
          >
            {content.subtitle}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 6 }}
          >
            {content.badges.map((badge, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.12)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(34, 211, 238, 0.2)",
                  },
                }}
              >
                <badge.icon sx={{ fontSize: 28, color: "#22d3ee" }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    color: "rgba(255, 255, 255, 0.95)",
                  }}
                >
                  {badge.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ pointerEvents: "auto" }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                const catalogSection = document.getElementById("catalog-section");
                if (catalogSection) {
                  catalogSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
                color: "#0a0e27",
                textTransform: "none",
                boxShadow: "0 8px 32px rgba(34, 211, 238, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 40px rgba(34, 211, 238, 0.6)",
                  background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
                },
              }}
            >
              {content.ctaPrimary}
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 3,
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "rgba(255, 255, 255, 0.95)",
                textTransform: "none",
                backdropFilter: "blur(12px)",
                background: "rgba(255, 255, 255, 0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.6)",
                  background: "rgba(255, 255, 255, 0.1)",
                  transform: "translateY(-3px)",
                },
              }}
            >
              {content.ctaSecondary}
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}
