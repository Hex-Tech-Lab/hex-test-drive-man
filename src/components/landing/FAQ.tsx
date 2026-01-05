"use client";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useParams } from "next/navigation";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const { locale } = useParams();
  const isRTL = locale === 'ar';

  const faqs = [
    {
      questionEn: "Can I test drive without an appointment?",
      questionAr: "هل يمكنني تجربة القيادة بدون موعد؟",
      answerEn: "Yes! Walk-in test drives are welcome, but booking guarantees availability and ensures we have the car ready for you.",
      answerAr: "نعم! تجارب القيادة بدون موعد مرحب بها، لكن الحجز يضمن التوفر ويضمن أن السيارة جاهزة لك.",
    },
    {
      questionEn: "What do I need to bring?",
      questionAr: "ماذا أحتاج أن أحضر؟",
      answerEn: "Valid Egyptian driving license and ID. That's it! No deposit or payment required.",
      answerAr: "رخصة قيادة مصرية سارية وبطاقة هوية. هذا كل شيء! لا يلزم دفع وديعة أو دفع.",
    },
    {
      questionEn: "Are test drives free?",
      questionAr: "هل تجارب القيادة مجانية؟",
      answerEn: "Absolutely. No deposit, no hidden fees, no obligation to purchase.",
      answerAr: "بالتأكيد. لا وديعة، لا رسوم خفية، لا التزام بالشراء.",
    },
    {
      questionEn: "Can I test drive electric or hybrid cars?",
      questionAr: "هل يمكنني تجربة قيادة السيارات الكهربائية أو الهجينة؟",
      answerEn: "Yes, we have EV and hybrid models available for test drives across all our showrooms.",
      answerAr: "نعم، لدينا موديلات كهربائية وهجينة متاحة لتجارب القيادة في جميع صالات العرض لدينا.",
    },
    {
      questionEn: "How many cars can I test drive?",
      questionAr: "كم عدد السيارات التي يمكنني تجربة قيادتها؟",
      answerEn: "Up to 3 vehicles per 90-day period to ensure fair access for all customers.",
      answerAr: "ما يصل إلى 3 مركبات كل 90 يومًا لضمان الوصول العادل لجميع العملاء.",
    },
    {
      questionEn: "Can I bring my pet on the test drive?",
      questionAr: "هل يمكنني إحضار حيواني الأليف في تجربة القيادة؟",
      answerEn: "Yes, pets are welcome! We want you to test the car in real-life conditions.",
      answerAr: "نعم، الحيوانات الأليفة مرحب بها! نريدك أن تختبر السيارة في ظروف الحياة الحقيقية.",
    },
    {
      questionEn: "What if I need to cancel or reschedule?",
      questionAr: "ماذا لو احتجت إلى الإلغاء أو إعادة الجدولة؟",
      answerEn: "No problem! Cancel or reschedule anytime up to 24 hours before your appointment through our website.",
      answerAr: "لا مشكلة! ألغِ أو أعد الجدولة في أي وقت حتى 24 ساعة قبل موعدك من خلال موقعنا.",
    },
    {
      questionEn: "Do you offer financing options?",
      questionAr: "هل تقدمون خيارات تمويل؟",
      answerEn: "Yes, our team can discuss financing and insurance options after your test drive if you're interested.",
      answerAr: "نعم، يمكن لفريقنا مناقشة خيارات التمويل والتأمين بعد تجربة القيادة إذا كنت مهتمًا.",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Container maxWidth="md">
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
          {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
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
            ? 'كل ما تحتاج إلى معرفته'
            : 'Everything you need to know'
          }
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: 0,
                  mb: 2,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  '& .MuiAccordionSummary-content': {
                    my: 1.5,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  {isRTL ? faq.questionAr : faq.questionEn}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: 3,
                  pb: 3,
                  pt: 0,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: '#64748b',
                    lineHeight: 1.8,
                  }}
                >
                  {isRTL ? faq.answerAr : faq.answerEn}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
