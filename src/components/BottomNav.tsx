'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import { useLanguageStore } from '@/stores/language-store';

/**
 * Fixed bottom navigation bar for mobile devices
 * Provides quick access to main app sections
 * 
 * Tabs: Home, Search, Sell, Notifications, More
 */
export default function BottomNav() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const language = useLanguageStore((state) => state.language);
  const [value, setValue] = useState(0);

  const labels = {
    home: language === 'ar' ? 'الرئيسية' : 'Home',
    search: language === 'ar' ? 'بحث' : 'Search',
    sell: language === 'ar' ? 'بيع' : 'Sell',
    notifications: language === 'ar' ? 'إشعارات' : 'Alerts',
    more: language === 'ar' ? 'المزيد' : 'More',
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navigation logic
    switch (newValue) {
      case 0:
        router.push(`/${locale}`);
        break;
      case 1:
        // Scroll to search bar
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 2:
        // TODO: Navigate to sell page (MVP 1.5)
        console.log('Sell feature coming soon');
        break;
      case 3:
        // TODO: Navigate to notifications (MVP 1.5)
        console.log('Notifications feature coming soon');
        break;
      case 4:
        // TODO: Open menu drawer (MVP 1.5)
        console.log('More menu coming soon');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: 'block', md: 'none' }, // Mobile only
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 60,
            padding: '6px 12px 8px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: 11,
            fontWeight: 500,
            mt: 0.5,
          },
          '& .Mui-selected': {
            fontSize: 11,
          },
        }}
      >
        <BottomNavigationAction
          label={labels.home}
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label={labels.search}
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label={labels.sell}
          icon={<AddCircleOutlineIcon />}
        />
        <BottomNavigationAction
          label={labels.notifications}
          icon={<NotificationsIcon />}
        />
        <BottomNavigationAction
          label={labels.more}
          icon={<MenuIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
