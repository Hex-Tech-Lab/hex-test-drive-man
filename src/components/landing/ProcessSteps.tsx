"use client";
import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { useParams } from "next/navigation";
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { motion } from "framer-motion";

const MotionCard = motion.create(Card);

export default function ProcessSteps() {
  const { locale } = useParams();
  const isRTL = locale === 'ar';

  const steps = [
    {
      icon: SearchIcon,
      titleEn: "Select Your Vehicle",
      titleAr: "اختر مركبتك",
      textEn: "Browse 3,000+ cars from 30+ brands. Filter by brand, model, budget, or body type.",
      textAr: "تصفح أكثر من 3,000 سيارة من 30+ علامة تجارية. فلتر حسب العلامة التجارية أو الموديل أو الميزانية أو نوع الهيكل.",
      color: "#3B82F6",
    },
    {
      icon: LocationOnIcon,
      titleEn: "Choose Location & Time",
      titleAr: "اختر الموقع والوقت",
      textEn: "Pick your preferred showroom (Cairo, Alexandria, Giza) and schedule a convenient time slot.",
      textAr: "اختر صالة العرض المفضلة لديك (القاهرة، الإسكندرية، الجيزة) وحدد موعدًا مناسبًا.",
      color: "#8B5CF6",
    },
    {
      icon: CheckCircleIcon,
      titleEn: "Book Your Test Drive",
      titleAr: "احجز تجربة القيادة",
      textEn: "Reserve up to 3 test drives per 90 days. No deposit required, free to book.",
      textAr: "احجز ما يصل إلى 3 تجارب قيادة كل 90 يومًا. لا يلزم دفع وديعة، الحجز مجاني.",
      color: "#EC4899",
    },
    {
      icon: DirectionsCarIcon,
      titleEn: "Experience & Decide",
      titleAr: "جرب وقرر",
      textEn: "Drive at your pace with our expert alongside. No sales pressure, just answers to your questions.",
      textAr: "قد بوتيرتك الخاصة مع خبيرنا بجانبك. لا ضغط مبيعات، فقط إجابات على أسئلتك.",
      color: "#10B981",
    },
  ];

  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            color: '#1e293b',
          }}
        >
          {isRTL ? 'كيف يعمل' : 'How It Works'}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: '#64748b',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          {isRTL 
            ? 'أربع خطوات بسيطة لتجربة قيادة سيارة أحلامك'
            : 'Four simple steps to test drive your dream car'
          }
        </Typography>

        <Grid container spacing={4}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <Icon sx={{ fontSize: 40, color: step.color }} />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      {isRTL ? step.titleAr : step.titleEn}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.7,
                      }}
                    >
                      {isRTL ? step.textAr : step.textEn}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
