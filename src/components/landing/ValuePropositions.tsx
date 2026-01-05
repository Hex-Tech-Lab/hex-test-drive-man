"use client";
import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { useParams } from "next/navigation";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import { motion } from "framer-motion";

const MotionCard = motion.create(Card);

export default function ValuePropositions() {
  const { locale } = useParams();
  const isRTL = locale === 'ar';

  const values = [
    {
      icon: LockOpenIcon,
      titleEn: "Unlocked Cars, Ready to Explore",
      titleAr: "سيارات مفتوحة، جاهزة للاستكشاف",
      textEn: "Every car on-site is unlocked. Step inside, check the space, try the seats—no permission needed.",
      textAr: "كل سيارة في الموقع مفتوحة. ادخل، تحقق من المساحة، جرب المقاعد - لا حاجة للإذن.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: AccessTimeIcon,
      titleEn: "Drive at Your Pace",
      titleAr: "قد بوتيرتك الخاصة",
      textEn: "No stopwatch, no pressure. Take the time you need to experience the car properly.",
      textAr: "لا ساعة توقيت، لا ضغط. خذ الوقت الذي تحتاجه لتجربة السيارة بشكل صحيح.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: ChatBubbleOutlineIcon,
      titleEn: "Expert Guidance, Not Sales Scripts",
      titleAr: "إرشاد خبير، وليس نصوص مبيعات",
      textEn: "Our team answers your questions without hovering or pushing. Your decision, your timeline.",
      textAr: "يجيب فريقنا على أسئلتك دون تحوم أو دفع. قرارك، جدولك الزمني.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: LocalCafeIcon,
      titleEn: "Warm Welcome Guarantee",
      titleAr: "ضمان الترحيب الحار",
      textEn: "Start with a hot drink and friendly chat. We want you to feel at home.",
      textAr: "ابدأ بمشروب ساخن ودردشة ودية. نريدك أن تشعر وكأنك في المنزل.",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
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
          {isRTL ? 'لماذا تختارنا' : 'Why Choose Us'}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: '#64748b',
            maxWidth: '700px',
            mx: 'auto',
          }}
        >
          {isRTL 
            ? 'تجربة تجربة قيادة مختلفة - مصممة لراحتك وثقتك'
            : 'A different test drive experience—designed for your comfort and confidence'
          }
        </Typography>

        <Grid container spacing={4}>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Grid item xs={12} sm={6} key={index}>
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      background: value.gradient,
                    }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        background: value.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Icon sx={{ fontSize: 36, color: 'white' }} />
                    </Box>

                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      {isRTL ? value.titleAr : value.titleEn}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.8,
                      }}
                    >
                      {isRTL ? value.textAr : value.textEn}
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
