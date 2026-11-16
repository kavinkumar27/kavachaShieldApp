import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  Button,
  IconButton
} from '@mui/material';
import {
  Shield,
  Search,
  Settings,
  Sparkles,
  Lock,
  User,
  Award,
  Zap
} from 'lucide-react';
import ShieldScreen from './components/ShieldScreen';
import ScannerScreen from './components/ScannerScreen';
import PlanScreen from './components/PlanScreen';
import SettingsScreen from './components/SettingsScreen';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import { getTranslation } from './utils/i18n';
import { showBannerAd, hideBannerAd, isProUser } from './services/adService';
import { initializeBilling, SUBSCRIPTION_SKUS } from './services/billingService';
import { getSharedText } from './services/kavachBridge';
import {
  isSessionUnlocked,
  lockAppSession,
  subscribeAuthState,
  isUserRegistered,
  isAppLockActive,
  getUserProfile
} from './services/authService';

const AVATAR_ICON_MAP = {
  shield: Shield,
  user: User,
  lock: Lock,
  award: Award,
  zap: Zap
};

// Security themed high-contrast MUI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f172a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#16a34a'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h6: {
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 12
  }
});

export default function App() {
  const [activeTab, setActiveTab] = useState(0); // 0: Shield, 1: Scanner, 2: Plan, 3: Settings
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('kavach_language');
      return saved === 'ta' ? 'ta' : 'en';
    } catch {
      return 'en';
    }
  });
  const [sharedText, setSharedText] = useState('');

  // User Profile State for Header Profile Icon & Name
  const [profile, setProfile] = useState(() => getUserProfile() || { name: 'Kavach User', avatarIcon: 'shield', avatarColor: '#38bdf8' });

  // Auth / App Lock State
  const [isUnlocked, setIsUnlocked] = useState(() => isSessionUnlocked());
  const [showAuthModal, setShowAuthModal] = useState(() => !isSessionUnlocked());

  // Payment Checkout State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(SUBSCRIPTION_SKUS.MONTHLY);

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  // Subscribe to auth & profile changes
  useEffect(() => {
    const unsubscribe = subscribeAuthState((state) => {
      setIsUnlocked(state.isUnlocked);
      setShowAuthModal(!state.isUnlocked);
      if (state.profile) {
        setProfile(state.profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize billing and check for shared intent
  useEffect(() => {
    initializeBilling();

    getSharedText().then((text) => {
      if (text && text.trim()) {
        setSharedText(text.trim());
        setActiveTab(1); // Jump straight to scanner
      }
    });
  }, []);

  // Manage banner ad visibility across tabs (Show on Shield & Scanner only)
  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      if (!isProUser()) {
        showBannerAd();
      }
    } else {
      hideBannerAd();
    }
  }, [activeTab]);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('kavach_language', newLang);
    } catch (e) {
      console.warn('Could not save language', e);
    }
  };

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const handleLockAppNow = () => {
    lockAppSession();
    setShowAuthModal(true);
  };

  const handleOpenPayment = (sku = SUBSCRIPTION_SKUS.MONTHLY) => {
    setPaymentPlan(sku);
    setPaymentModalOpen(true);
  };

  const HeaderAvatarIcon = AVATAR_ICON_MAP[profile.avatarIcon] || Shield;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Fullscreen Biometric / PIN App Lock Modal */}
      <AuthModal
        open={showAuthModal || !isUnlocked}
        lang={lang}
        onUnlockSuccess={() => {
          setIsUnlocked(true);
          setShowAuthModal(false);
        }}
      />

      {/* Interactive Working Payment Gateway Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialPlan={paymentPlan}
        lang={lang}
        onSuccess={() => {
          setPaymentModalOpen(false);
        }}
      />

      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          maxWidth: '100%',
          overflowX: 'hidden',
          bgcolor: '#0b1120',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          p: 0
        }}
      >
        {/* Mobile Viewport Container */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 480 },
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            overflowX: 'hidden'
          }}
        >
          {/* Top App Bar with Profile Icon & Name in Right Corner */}
          <Paper
            elevation={2}
            square
            sx={{
              px: 2,
              pt: 'calc(env(safe-area-inset-top, 28px) + 10px)',
              pb: 1.5,
              bgcolor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Left: App Logo & Branding */}
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  bgcolor: '#1e293b',
                  p: 0.7,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Shield size={20} color="#38bdf8" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: -0.2,
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t('appName')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    whiteSpace: 'nowrap',
                    display: 'block'
                  }}
                >
                  {t('appSubtitle')}
                </Typography>
              </Box>
            </Stack>

            {/* Right: Profile Icon + Name & Controls */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Profile Icon with User's Name Button (Direct jump to Settings) */}
              <Box
                onClick={() => setActiveTab(3)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' },
                  borderRadius: 4,
                  py: 0.35,
                  px: 1,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  maxWidth: 120
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: profile.avatarColor || '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 0.8,
                    flexShrink: 0
                  }}
                >
                  <HeaderAvatarIcon size={12} color="#ffffff" />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {profile.name ? profile.name.split(' ')[0] : 'User'}
                </Typography>
              </Box>

              {/* Language Switch Pill */}
              <Button
                size="small"
                onClick={() => handleLanguageChange(lang === 'en' ? 'ta' : 'en')}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                  borderRadius: 4,
                  px: 1.2,
                  py: 0.4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: 'auto',
                  flexShrink: 0
                }}
              >
                {lang === 'en' ? 'தமிழ்' : 'EN'}
              </Button>

              {/* Quick Lock Icon */}
              {isUserRegistered() && isAppLockActive() && (
                <IconButton
                  size="small"
                  onClick={handleLockAppNow}
                  title="Lock App"
                  sx={{
                    color: '#94a3b8',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)', color: '#ffffff' },
                    p: 0.6
                  }}
                >
                  <Lock size={14} />
                </IconButton>
              )}
            </Stack>
          </Paper>

          {/* Main Scrollable Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2,
              pb: 'calc(80px + env(safe-area-inset-bottom, 16px))',
              width: '100%'
            }}
          >
            {activeTab === 0 && (
              <ShieldScreen
                lang={lang}
                onNavigateToScanner={() => setActiveTab(1)}
              />
            )}
            {activeTab === 1 && (
              <ScannerScreen
                lang={lang}
                initialText={sharedText}
              />
            )}
            {activeTab === 2 && (
              <PlanScreen
                lang={lang}
                onOpenPayment={handleOpenPayment}
              />
            )}
            {activeTab === 3 && (
              <SettingsScreen
                lang={lang}
                onLanguageChange={handleLanguageChange}
                onLockApp={handleLockAppNow}
              />
            )}
          </Box>

          {/* Bottom Navigation Bar with 4 Separate Tabs */}
          <Paper
            elevation={4}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: { xs: '100%', sm: 480 },
              margin: '0 auto',
              zIndex: 1000,
              borderTop: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              pb: 'calc(env(safe-area-inset-bottom, 16px) + 2px)'
            }}
          >
            <BottomNavigation
              showLabels
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                height: 62,
                '& .Mui-selected': {
                  color: '#0f172a',
                  fontWeight: 700
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  mt: 0.3
                }
              }}
            >
              <BottomNavigationAction
                label={t('tabShield')}
                icon={<Shield size={19} />}
              />
              <BottomNavigationAction
                label={t('tabScanner')}
                icon={<Search size={19} />}
              />
              <BottomNavigationAction
                label={t('tabPlan')}
                icon={<Sparkles size={19} color={activeTab === 2 ? '#d97706' : undefined} />}
              />
              <BottomNavigationAction
                label={t('tabSettings')}
                icon={<Settings size={19} />}
              />
            </BottomNavigation>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
