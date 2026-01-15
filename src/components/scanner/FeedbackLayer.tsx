/**
 * Sensory Feedback Layer - Visual, Haptic, Audio
 * Created: 2026-01-08
 * Agent: BB
 * MVP 1.5: Smart Document Capture
 * 
 * Features:
 * - Visual: Green overlay on document lock
 * - Haptic: Vibration on lock (200ms)
 * - Audio: Arabic speech "ثابت" (stable)
 */

'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FeedbackLayerProps {
  isStable: boolean;
  language?: 'en' | 'ar';
}

/**
 * Provides multi-sensory feedback when document is detected and stable
 * - Visual: Green checkmark overlay
 * - Haptic: Device vibration
 * - Audio: Speech synthesis in Arabic/English
 */
export default function FeedbackLayer({ isStable, language = 'en' }: FeedbackLayerProps) {
  const previousStableRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Trigger feedback only on transition to stable (not continuously)
    if (isStable && !previousStableRef.current && !hasTriggeredRef.current) {
      triggerFeedback();
      hasTriggeredRef.current = true;
    }

    // Reset trigger when unstable
    if (!isStable) {
      hasTriggeredRef.current = false;
    }

    previousStableRef.current = isStable;
  }, [isStable, language]);

  /**
   * Trigger all feedback mechanisms
   */
  const triggerFeedback = () => {
    // 1. Haptic Feedback (Vibration)
    triggerHaptic();

    // 2. Audio Feedback (Speech)
    triggerAudio();
  };

  /**
   * Trigger haptic vibration (200ms)
   */
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(200);
      } catch (err) {
        console.warn('Vibration not supported:', err);
      }
    }
  };

  /**
   * Trigger audio feedback using Speech Synthesis
   */
  const triggerAudio = () => {
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance();
        
        // Set language and text
        if (language === 'ar') {
          utterance.lang = 'ar-EG'; // Egyptian Arabic
          utterance.text = 'ثابت'; // "Stable"
        } else {
          utterance.lang = 'en-US';
          utterance.text = 'Stable';
        }

        // Speech parameters
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Speak
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis not supported:', err);
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      {/* Visual Feedback - Green Checkmark */}
      {isStable && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            animation: 'fadeIn 0.3s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'scale(0.8)' },
              to: { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: '#00ff00',
              filter: 'drop-shadow(0 0 10px rgba(0, 255, 0, 0.8))',
              animation: 'pulse 1s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              color: '#00ff00',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {language === 'ar' ? 'ثابت - جاري التقاط الصورة' : 'Stable - Capturing'}
          </Typography>
        </Box>
      )}

      {/* Instructions Overlay */}
      {!isStable && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          <Typography variant="body1">
            {language === 'ar'
              ? 'ضع البطاقة داخل الإطار وثبتها'
              : 'Place ID card within frame and hold steady'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
