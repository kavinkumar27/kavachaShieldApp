import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Alert,
  Snackbar,
  Chip,
  Divider
} from '@mui/material';
import {
  Star,
  Check,
  Sparkles,
  Receipt,
  RotateCw,
  Zap,
  Lock
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import {
  SUBSCRIPTION_SKUS,
  subscribeProStatus,
  restorePurchases
} from '../services/billingService';
import { isProUser, hideBannerAd } from '../services/adService';

export default function PlanScreen({
  lang,
  onOpenPayment
}) {
  const [isPro, setIsPro] = useState(() => isProUser());
  const [proExpiry, setProExpiry] = useState(() => localStorage.getItem('kavach_pro_expiry') || 'Active');
  const [lastReceipt, setLastReceipt] = useState(() => {
    try {
      const stored = localStorage.getItem('kavach_last_receipt');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRestoring, setIsRestoring] = useState(false);

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  useEffect(() => {
    const unsubscribe = subscribeProStatus((status) => {
      setIsPro(status);
      setProExpiry(localStorage.getItem('kavach_pro_expiry') || 'Active');
      try {
        const stored = localStorage.getItem('kavach_last_receipt');
        setLastReceipt(stored ? JSON.parse(stored) : null);
      } catch (e) {
        console.warn('Receipt load error', e);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleProForTest = () => {
    const nextProState = !isPro;
    try {
      localStorage.setItem('isProUser', nextProState ? 'true' : 'false');
      if (nextProState) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        const expStr = expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        localStorage.setItem('kavach_pro_expiry', expStr);
        setProExpiry(expStr);
      } else {
        localStorage.removeItem('kavach_pro_expiry');
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
    setIsPro(nextProState);
    if (nextProState) {
      hideBannerAd();
    }
    setSnackbar({
      open: true,
      message: nextProState ? 'Kavach Pro activated (Test Mode)!' : 'Switched to Free version.',
      severity: nextProState ? 'success' : 'info'
    });
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const res = await restorePurchases();
      if (res.active) {
        setIsPro(true);
        setSnackbar({
          open: true,
          message: t('restoreSuccessMsg'),
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'No previous Google Play subscriptions found.',
          severity: 'info'
        });
      }
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden', pb: 4 }}>
      {/* Page Title */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
          {t('tabPlan')}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
          {isPro ? 'Manage your active subscription and benefits' : 'Upgrade to Kavach Pro for complete ad-free protection'}
        </Typography>
      </Box>

      {/* Main Pro Membership Card */}
      <Card
        elevation={3}
        sx={{
          borderRadius: 3.5,
          border: isPro ? '2px solid #22c55e' : '1.5px solid #fbbf24',
          background: isPro
            ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          overflow: 'hidden',
          mb: 2.5
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Star size={22} color="#fbbf24" fill="#fbbf24" />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                {t('proCardTitle')}
              </Typography>
            </Stack>
            <Chip
              label={isPro ? t('proStatusActive') : t('proStatusFree')}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: isPro ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff'
              }}
            />
          </Stack>

          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', display: 'block', mb: 2.5 }}>
            {t('proCardSubtitle')}
          </Typography>

          {/* Features List */}
          <Stack spacing={1.2} sx={{ mb: 3 }}>
            {[t('proFeature1'), t('proFeature2'), t('proFeature3'), t('proFeature4')].map((feat, i) => (
              <Stack key={i} direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'rgba(251, 191, 36, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Check size={13} color="#fbbf24" />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500, fontSize: '0.85rem' }}>
                  {feat}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {!isPro ? (
            /* Purchase Buttons */
            <Stack spacing={1.8}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => onOpenPayment(SUBSCRIPTION_SKUS.MONTHLY)}
                startIcon={<Zap size={18} />}
                sx={{
                  bgcolor: '#fbbf24',
                  color: '#1e1b4b',
                  '&:hover': { bgcolor: '#f59e0b' },
                  fontWeight: 800,
                  borderRadius: 2.5,
                  py: 1.3,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                {t('upgradeMonthlyBtn')}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => onOpenPayment(SUBSCRIPTION_SKUS.YEARLY)}
                startIcon={<Star size={18} />}
                sx={{
                  borderColor: '#fbbf24',
                  color: '#fbbf24',
                  '&:hover': { borderColor: '#ffffff', color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.08)' },
                  fontWeight: 800,
                  borderRadius: 2.5,
                  py: 1.3,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                {t('upgradeYearlyBtn')}
              </Button>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  startIcon={<RotateCw size={13} />}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'none',
                    fontSize: '0.75rem'
                  }}
                >
                  {t('restorePurchasesBtn')}
                </Button>

                <Button
                  size="small"
                  variant="text"
                  onClick={handleToggleProForTest}
                  startIcon={<Sparkles size={13} />}
                  sx={{
                    color: '#fbbf24',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Instant Test Pro
                </Button>
              </Stack>
            </Stack>
          ) : (
            /* Active Pro Member View */
            <Box>
              <Alert severity="success" sx={{ bgcolor: 'rgba(34, 197, 94, 0.25)', color: '#ffffff', borderRadius: 2, mb: 2 }}>
                Kavach Pro Active! Valid until: <strong>{proExpiry}</strong>
              </Alert>

              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={handleToggleProForTest}
                sx={{
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  borderRadius: 2
                }}
              >
                {t('manageSubBtn')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Digital Receipt Card (if available) */}
      {lastReceipt && isPro && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            mb: 2.5
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Receipt size={18} color="#0f172a" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Active Subscription Receipt
            </Typography>
          </Stack>
          <Divider sx={{ mb: 1.5 }} />

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: '#64748b' }}>Order Ref:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{lastReceipt.txId}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: '#64748b' }}>Subscribed Plan:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{lastReceipt.plan}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: '#64748b' }}>Paid Via:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{lastReceipt.method}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: '#64748b' }}>Next Renewal Date:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a' }}>{lastReceipt.validUntil}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Security & Guarantee Note */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Lock size={16} color="#64748b" />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
            {t('privacyNoticeTitle')}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4 }}>
          {t('privacyNoticeDesc')}
        </Typography>
      </Paper>

      {/* Snackbar alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
