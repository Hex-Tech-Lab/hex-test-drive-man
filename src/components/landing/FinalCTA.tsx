"use client";
import { Box, Container, Typography, Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function FinalCTA() {
  const { locale } = useParams();
  const router = useRouter();
  const isRTL = locale === 'ar';

  const handleBrowseVehicles = () => {
    router.push(`/${locale}`);
  };

  const handleContactUs = () => {
    router.push(`/${locale}/contact`);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
        overflow: 'hidden',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-50%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontSize: { xs: '2rem', md: '3.5rem' },
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isRTL ? 'هل أنت مستعد للعثور على سيارتك المثالية؟' : 'Ready to Find Your Perfect Car?'}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 5,
              opacity: 0.9,
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.4rem' },
            }}
          >
            {isRTL 
              ? '3,000+ مركبة في انتظارك. احجز تجربة القيادة اليوم.'
              : '3,000+ vehicles waiting. Book your test drive today.'
            }
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              justifyContent: 'center',
              alignItems: 'center',
              mb: 6,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleBrowseVehicles}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.5)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: '100%', sm: '220px' },
              }}
            >
              {isRTL ? 'تصفح المركبات' : 'Browse Vehicles'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleContactUs}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                borderColor: 'white',
                color: 'white',
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-3px)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: '100%', sm: '220px' },
              }}
            >
              {isRTL ? 'اتصل بنا' : 'Contact Us'}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 4 },
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.8,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LockIcon sx={{ fontSize: 24 }} />
              {isRTL ? 'بياناتك آمنة' : 'Your data is secure'}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon sx={{ fontSize: 24 }} />
              {isRTL ? 'دعم 24/7' : '24/7 support'}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ fontSize: 24 }} />
              {isRTL ? 'لا التزام' : 'No obligation'}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
