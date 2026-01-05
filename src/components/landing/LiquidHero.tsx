"use client";
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Box, Typography, Button, Container } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

export default function LiquidHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { locale } = useParams();
  const router = useRouter();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application();
    
    app.init({
      canvas: canvasRef.current,
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
    }).then(() => {
      const container = new PIXI.Container();
      app.stage.addChild(container);

      interface BlobSprite extends PIXI.Sprite {
        vx: number;
        vy: number;
        baseScale: number;
      }

      const blobs: BlobSprite[] = [];
      const colors = [0x22D3EE, 0x4F46E5, 0xEC4899, 0xA855F7, 0x3B82F6, 0x8B5CF6];

      function createBlob(color: number, radius: number): BlobSprite {
        const g = new PIXI.Graphics();
        g.circle(0, 0, radius);
        g.fill(color);
        const tex = app.renderer.generateTexture(g);
        const sprite = new PIXI.Sprite(tex) as BlobSprite;
        sprite.anchor.set(0.5);
        return sprite;
      }

      for (let i = 0; i < 8; i++) {
        const blob = createBlob(colors[i % colors.length], 120 + Math.random() * 80);
        blob.x = window.innerWidth * Math.random();
        blob.y = window.innerHeight * Math.random();
        blob.vx = (Math.random() - 0.5) * 0.5;
        blob.vy = (Math.random() - 0.5) * 0.5;
        blob.baseScale = 0.7 + Math.random() * 0.4;
        blob.scale.set(blob.baseScale);
        container.addChild(blob);
        blobs.push(blob);
      }

      const blur = new PIXI.BlurFilter();
      blur.blur = 40;
      blur.quality = 4;

      // Apply blur filter for liquid/gooey effect
      container.filters = [blur];

      let t = 0;
      app.ticker.add((ticker) => {
        const delta = ticker.deltaTime;
        t += delta * 0.01;

        blobs.forEach((b, i) => {
          b.x += b.vx * delta;
          b.y += b.vy * delta;

          const pulse = 0.05 * Math.sin(t * (1 + i * 0.2));
          b.scale.set(b.baseScale + pulse);

          if (b.x < -200 || b.x > window.innerWidth + 200) b.vx *= -1;
          if (b.y < -200 || b.y > window.innerHeight + 200) b.vy *= -1;
        });

        blur.blur = 35 + 8 * Math.sin(t * 1.2);
      });
    });

    return () => {
      app.destroy(true, { children: true });
    };
  }, []);

  const handleBrowseVehicles = () => {
    router.push(`/${locale}`);
  };

  const handleHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #050816 0%, #0a1128 50%, #0f1b3a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.6,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          color: 'white',
          px: { xs: 2, sm: 4 },
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
            fontWeight: 700,
            letterSpacing: '0.02em',
            mb: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {isRTL ? 'اختبر قيادة سيارة أحلامك في مصر' : 'Test Drive Your Dream Car in Egypt'}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            mb: 4,
            opacity: 0.9,
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          {isRTL 
            ? '3,000+ مركبة • 30+ علامة تجارية • بدون ضغط، فقط قيادة'
            : '3,000+ vehicles • 30+ brands • No pressure, just drive'
          }
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleBrowseVehicles}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              },
              transition: 'all 0.3s ease',
              minWidth: { xs: '100%', sm: '200px' },
            }}
          >
            {isRTL ? 'تصفح المركبات' : 'Browse Vehicles'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleHowItWorks}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              minWidth: { xs: '100%', sm: '200px' },
            }}
          >
            {isRTL ? 'كيف يعمل' : 'How It Works'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 3 },
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.8,
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
              }}
            />
            {isRTL ? 'حجز مجاني' : 'Free to book'}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
              }}
            />
            {isRTL ? 'بدون رسوم خفية' : 'No hidden fees'}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
              }}
            />
            {isRTL ? '94 علامة تجارية متاحة' : '94 brands available'}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
