"use client";
import { Box } from "@mui/material";
import LiquidHero from "./LiquidHero";
import ProcessSteps from "./ProcessSteps";
import ValuePropositions from "./ValuePropositions";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";

export default function LandingPageContent() {
  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <LiquidHero />
      <ProcessSteps />
      <ValuePropositions />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </Box>
  );
}
