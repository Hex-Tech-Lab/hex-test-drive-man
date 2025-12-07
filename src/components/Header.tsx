'use client';

import { AppBar, Toolbar, Typography, IconButton, Badge, Button, Container } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useLanguageStore } from '@/stores/language-store';
import { useCompareStore } from '@/stores/compare-store';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const compareItems = useCompareStore((state) => state.compareItems);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang); // Update store for immediate UI feedback

    // Replace the current locale in the pathname with the new locale
    const currentPathSegments = pathname.split('/').filter(Boolean); // Remove empty strings
    // If the first segment is the current language, replace it
    if (currentPathSegments.length > 0 && currentPathSegments[0] === language) {
      currentPathSegments[0] = newLang;
    } else {
      // If no locale in path, prepend new locale
      currentPathSegments.unshift(newLang);
    }
    const newPath = `/${currentPathSegments.join('/')}`;
    
    router.push(newPath); // Navigate to the same path with new locale
  };

  const goToCompare = () => {
    router.push(`/${language}/compare`);
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {language === 'ar' ? 'منصة اختبار القيادة' : 'Test Drive Platform'}
          </Typography>

          <Button
            variant="outlined"
            onClick={toggleLanguage}
            sx={{ mr: 2 }}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>

          <IconButton color="primary" onClick={goToCompare}>
            <Badge badgeContent={compareItems.length} color="error">
              <CompareArrowsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
