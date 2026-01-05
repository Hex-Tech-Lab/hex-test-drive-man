"use client";
import { Box, Container, Typography, Card, CardContent, Avatar, Rating } from "@mui/material";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

const MotionCard = motion.create(Card);

export default function Testimonials() {
  const { locale } = useParams();
  const isRTL = locale === 'ar';

  const testimonials = [
    {
      quoteEn: "No pressure, just a genuine experience. I tested the BMW X5 and felt completely at ease.",
      quoteAr: "لا ضغط، فقط تجربة حقيقية. اختبرت BMW X5 وشعرت بالراحة التامة.",
      nameEn: "Ahmed M., Cairo",
      nameAr: "أحمد م.، القاهرة",
      rating: 5,
      avatar: "A",
      color: "#3B82F6",
    },
    {
      quoteEn: "The team explained every feature without pushing. I drove three cars before deciding.",
      quoteAr: "شرح الفريق كل ميزة دون دفع. قدت ثلاث سيارات قبل أن أقرر.",
      nameEn: "Mona K., Alexandria",
      nameAr: "منى ك.، الإسكندرية",
      rating: 5,
      avatar: "M",
      color: "#8B5CF6",
    },
    {
      quoteEn: "Best test drive experience in Egypt. Professional, friendly, and no hidden fees.",
      quoteAr: "أفضل تجربة قيادة في مصر. محترف، ودود، وبدون رسوم خفية.",
      nameEn: "Youssef T., Giza",
      nameAr: "يوسف ت.، الجيزة",
      rating: 5,
      avatar: "Y",
      color: "#EC4899",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
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
          {isRTL ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
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
            ? 'تجارب حقيقية من عملاء راضين'
            : 'Real experiences from satisfied customers'
          }
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Rating
                  value={testimonial.rating}
                  readOnly
                  sx={{
                    mb: 2,
                    '& .MuiRating-iconFilled': {
                      color: '#FCD34D',
                    },
                  }}
                />

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: '#475569',
                    lineHeight: 1.8,
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                  }}
                >
                  "{isRTL ? testimonial.quoteAr : testimonial.quoteEn}"
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: testimonial.color,
                      width: 50,
                      height: 50,
                      fontSize: '1.25rem',
                      fontWeight: 600,
                    }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      {isRTL ? testimonial.nameAr : testimonial.nameEn}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                      }}
                    >
                      {isRTL ? 'عميل موثق' : 'Verified Customer'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MotionCard>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
