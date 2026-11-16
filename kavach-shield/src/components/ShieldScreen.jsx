import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import {
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  RefreshCw,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  addNotificationScanListener
} from '../services/kavachBridge';
import { analyzeContent } from '../utils/scamDetector';
import { getTranslation } from '../utils/i18n';

export default function ShieldScreen({ lang, onNavigateToScanner }) {
  const [isProtected, setIsProtected] = useState(false);
  const [scannedToday, setScannedToday] = useState(() => {
    try {
      const todayKey = 'kavach_scanned_today_' + new Date().toISOString().slice(0, 10);
      return parseInt(localStorage.getItem(todayKey) || '0', 10);
    } catch {
      return 0;
    }
  });
  const [threatsBlocked, setThreatsBlocked] = useState(() => {
    try {
      return parseInt(localStorage.getItem('kavach_threats_blocked') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [recentAlerts, setRecentAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kavach_recent_alerts') || '[]');
    } catch {
      return [];
    }
  });

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  const checkPermissionStatus = useCallback(async () => {
    const granted = await checkNotificationPermission();
    setIsProtected(granted);
  }, []);

  const handleIncomingNotification = useCallback((data) => {
    const { title = '', text = '', packageName = '' } = data || {};
    const fullText = `${title}: ${text}`.trim();
    if (!fullText) return;

    const analysis = analyzeContent(fullText);

    // Update counters
    const todayKey = 'kavach_scanned_today_' + new Date().toISOString().slice(0, 10);
    const isThreat = analysis.level === 'DANGER' || analysis.level === 'WARNING';

    setScannedToday((prev) => {
      const updated = prev + 1;
      try {
        localStorage.setItem(todayKey, updated.toString());
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });

    if (isThreat) {
      setThreatsBlocked((prev) => {
        const updated = prev + 1;
        try {
          localStorage.setItem('kavach_threats_blocked', updated.toString());
        } catch (e) {
          console.warn('Storage error:', e);
        }
        return updated;
      });
    }

    // Update recent alerts list
    const newAlert = {
      id: Date.now(),
      title: title || (packageName.includes('whatsapp') ? 'WhatsApp Alert' : 'SMS Alert'),
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: analysis.level,
      riskScore: analysis.riskScore,
      reasons: analysis.reasons
    };

    setRecentAlerts((prev) => {
      const updated = [newAlert, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('kavach_recent_alerts', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    checkPermissionStatus();

    // Listen to native incoming notifications scanned by KavachNotificationService
    const listener = addNotificationScanListener((data) => {
      handleIncomingNotification(data);
    });

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [checkPermissionStatus, handleIncomingNotification]);

  const handleEnableProtection = async () => {
    await requestNotificationPermission();
    // Re-check after short delay for user returning from Settings
    setTimeout(checkPermissionStatus, 1500);
  };

  const handleClearAlerts = () => {
    try {
      localStorage.removeItem('kavach_recent_alerts');
    } catch (e) {
      console.warn('Storage error:', e);
    }
    setRecentAlerts([]);
  };

  const getBadgeColor = (level) => {
    if (level === 'DANGER') return { bg: '#ffebee', text: '#c62828', border: '#ef5350' };
    if (level === 'WARNING') return { bg: '#fff8e1', text: '#f57f17', border: '#ffb74d' };
    return { bg: '#e8f5e9', text: '#2e7d32', border: '#81c784' };
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden', pb: 2 }}>
      {/* 1. Real-time Protection Status Card */}
      <Card
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mb: 2.5,
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid',
          borderColor: isProtected ? 'rgba(46, 125, 50, 0.3)' : 'rgba(211, 47, 47, 0.3)',
          background: isProtected
            ? 'linear-gradient(135deg, #0d381e 0%, #1b5e20 100%)'
            : 'linear-gradient(135deg, #421111 0%, #7f1d1d 100%)',
          color: '#ffffff'
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: '50%',
                bgcolor: isProtected ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isProtected ? (
                <ShieldCheck size={32} color="#4ade80" />
              ) : (
                <ShieldAlert size={32} color="#f87171" />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {isProtected ? t('protectionActive') : t('protectionInactive')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5, display: 'block', lineHeight: 1.3 }}>
                {isProtected ? t('protectionActiveDesc') : t('protectionInactiveDesc')}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            {!isProtected ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleEnableProtection}
                sx={{
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' },
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.2,
                  textTransform: 'none'
                }}
              >
                {t('enableProtectionBtn')}
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={checkPermissionStatus}
                startIcon={<RefreshCw size={16} />}
                sx={{
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                {t('checkStatusBtn')}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* 2. Summary Counters */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, width: '100%' }}>
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {scannedToday}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>
            {t('scannedToday')}
          </Typography>
        </Paper>

        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626' }}>
            {threatsBlocked}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>
            {t('threatsBlocked')}
          </Typography>
        </Paper>
      </Stack>

      {/* 3. Emergency Action Button (Helpline 1930) */}
      <Card
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          p: 2,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <PhoneCall size={20} color="#f87171" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fca5a5' }}>
            {t('helplineTitle')}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5, lineHeight: 1.3 }}>
          {t('helplineDesc')}
        </Typography>
        <Button
          component="a"
          href="tel:1930"
          variant="contained"
          fullWidth
          startIcon={<PhoneCall size={18} />}
          sx={{
            bgcolor: '#dc2626',
            '&:hover': { bgcolor: '#b91c1c' },
            fontWeight: 800,
            borderRadius: 2.5,
            py: 1.2,
            textTransform: 'none',
            fontSize: '0.95rem'
          }}
        >
          {t('callHelplineBtn')}
        </Button>
      </Card>

      {/* 4. Live Recent Alerts Feed */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
          {t('recentAlerts')}
        </Typography>
        {recentAlerts.length > 0 && (
          <IconButton size="small" onClick={handleClearAlerts} title={t('clearAlerts')}>
            <Trash2 size={16} color="#64748b" />
          </IconButton>
        )}
      </Box>

      {recentAlerts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px dashed #cbd5e1',
            textAlign: 'center',
            bgcolor: '#f8fafc',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <CheckCircle2 size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {t('noAlertsYet')}
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={onNavigateToScanner}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
          >
            {t('tabScanner')} →
          </Button>
        </Paper>
      ) : (
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          {recentAlerts.map((alert) => {
            const colors = getBadgeColor(alert.level);
            return (
              <Card
                key={alert.id}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  borderColor: colors.border,
                  bgcolor: '#ffffff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Chip
                      label={t(alert.level === 'DANGER' ? 'levelDanger' : alert.level === 'WARNING' ? 'levelWarning' : 'levelSafe')}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        bgcolor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {alert.timestamp}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5, wordBreak: 'break-word' }}>
                    {alert.title}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#475569',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {alert.text}
                  </Typography>

                  {alert.reasons && alert.reasons.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ color: colors.text, fontWeight: 600, wordBreak: 'break-word' }}>
                        {alert.reasons[0]}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
