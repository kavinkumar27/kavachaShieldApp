import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Share2,
  Link as LinkIcon,
  RotateCcw
} from 'lucide-react';
import { analyzeContent, checkGoogleSafeBrowsing } from '../utils/scamDetector';
import { getTranslation } from '../utils/i18n';
import { handleScanMonetization } from '../services/adService';
import { getSharedText } from '../services/kavachBridge';

const SAMPLE_CHIPS = [
  {
    key: 'chipElectricity',
    text: 'Dear consumer, your electricity power supply will be disconnected tonight 9:30 PM due to unpaid bill. Download bill app immediately: http://bescom-pay.xyz/update.apk'
  },
  {
    key: 'chipKyc',
    text: 'Urgent Alert: Your SBI NetBanking & PAN card block alert. Update your KYC within 24 hrs to avoid suspension: https://bit.ly/sbi-pan-kyc'
  },
  {
    key: 'chipDigitalArrest',
    text: 'CBI & Police Notice: An illegal customs parcel under your Aadhaar has been seized. Join digital arrest police video call immediately.'
  },
  {
    key: 'chipSafeUpi',
    text: 'Payment received via Google Pay. Check balance on official portal: https://pay.google.com/intl/en_in/about/'
  }
];

export default function ScannerScreen({ lang, initialText = '' }) {
  const [inputText, setInputText] = useState(initialText);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  const recordScanHistory = useCallback((rawText, result) => {
    try {
      const todayKey = 'kavach_scanned_today_' + new Date().toISOString().slice(0, 10);
      const currentScanned = parseInt(localStorage.getItem(todayKey) || '0', 10);
      localStorage.setItem(todayKey, (currentScanned + 1).toString());

      if (result.level === 'DANGER' || result.level === 'WARNING') {
        const currentThreats = parseInt(localStorage.getItem('kavach_threats_blocked') || '0', 10);
        localStorage.setItem('kavach_threats_blocked', (currentThreats + 1).toString());
      }

      // Add to recent alerts
      const alerts = JSON.parse(localStorage.getItem('kavach_recent_alerts') || '[]');
      const newAlert = {
        id: Date.now(),
        title: 'Manual Scanner Check',
        text: rawText.slice(0, 120),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: result.level,
        riskScore: result.riskScore,
        reasons: result.reasons
      };
      localStorage.setItem('kavach_recent_alerts', JSON.stringify([newAlert, ...alerts.slice(0, 19)]));
    } catch (e) {
      console.warn('Failed to record history:', e);
    }
  }, []);

  const runAnalysis = useCallback(async (textToScan) => {
    const targetText = textToScan !== undefined ? textToScan : inputText;
    if (!targetText || !targetText.trim()) return;

    setIsScanning(true);

    try {
      // 1. Run local zero-cloud heuristic engine
      const result = analyzeContent(targetText);

      // 2. Check Google Safe Browsing if URLs present
      if (result.urls && result.urls.length > 0) {
        const safeBrowsing = await checkGoogleSafeBrowsing(result.urls);
        if (safeBrowsing.checked && !safeBrowsing.safe) {
          result.level = 'DANGER';
          result.riskScore = 100;
          result.reasons.unshift('Flagged as an active threat by Google Safe Browsing database.');
        }
      }

      setAnalysisResult(result);

      // 3. Record scan in statistics and trigger monetization logic
      recordScanHistory(targetText, result);
      await handleScanMonetization();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [inputText, recordScanHistory]);

  const checkForSharedIntentText = useCallback(async () => {
    const shared = await getSharedText();
    if (shared && shared.trim()) {
      setInputText(shared.trim());
      runAnalysis(shared.trim());
    }
  }, [runAnalysis]);

  // Auto-populate when shared via Android Share Sheet or passed as prop
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      runAnalysis(initialText);
    } else {
      checkForSharedIntentText();
    }
  }, [initialText, runAnalysis, checkForSharedIntentText]);

  const handleChipSelect = (text) => {
    setInputText(text);
    runAnalysis(text);
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
  };

  const handleAlertFamily = () => {
    let contacts = [];
    try {
      contacts = JSON.parse(localStorage.getItem('kavach_family_contacts') || '[]');
    } catch {
      contacts = [];
    }
    const primaryNumber = contacts.length > 0 ? contacts[0].replace(/[^0-9]/g, '') : '';

    if (!primaryNumber) {
      setSnackbar({
        open: true,
        message: t('noFamilyNumberWarning'),
        severity: 'warning'
      });
      return;
    }

    const warningText = encodeURIComponent(
      `⚠️ *KAVACH SECURITY ALERT*\n\nI just checked a suspicious message on my Kavach Shield app and it was flagged as *${analysisResult?.level}* (Risk Score: ${analysisResult?.riskScore}/100).\n\n*Threat Reasons:*\n${analysisResult?.reasons?.map((r) => `• ${r}`).join('\n')}\n\n*Original Suspicious Text:*\n"${inputText}"\n\n_Please do not open any links or send money!_`
    );

    const waUrl = `https://wa.me/${primaryNumber}?text=${warningText}`;
    window.open(waUrl, '_blank');

    setSnackbar({
      open: true,
      message: t('shareSuccessMsg'),
      severity: 'success'
    });
  };

  const getVerdictDetails = (level) => {
    switch (level) {
      case 'DANGER':
        return {
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#f87171',
          icon: <XCircle size={32} color="#dc2626" />,
          title: t('levelDanger'),
          desc: t('dangerVerdictDesc')
        };
      case 'WARNING':
        return {
          color: '#d97706',
          bg: '#fffbeb',
          border: '#fcd34d',
          icon: <AlertTriangle size={32} color="#d97706" />,
          title: t('levelWarning'),
          desc: t('warningVerdictDesc')
        };
      case 'SAFE':
      default:
        return {
          color: '#16a34a',
          bg: '#f0fdf4',
          border: '#86efac',
          icon: <CheckCircle2 size={32} color="#16a34a" />,
          title: t('levelSafe'),
          desc: t('safeVerdictDesc')
        };
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden', pb: 2 }}>
      {/* Header Info */}
      <Box sx={{ mb: 2, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
          {t('scannerTitle')}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
          {t('scannerSubtitle')}
        </Typography>
      </Box>

      {/* Input Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          mb: 2.5,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <TextField
          multiline
          minRows={3}
          maxRows={6}
          fullWidth
          variant="standard"
          placeholder={t('inputPlaceholder')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          InputProps={{
            disableUnderline: true,
            style: { fontSize: '0.95rem', width: '100%', wordBreak: 'break-word' }
          }}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="flex-end" alignItems="center">
          {inputText && (
            <Button
              size="small"
              onClick={handleClear}
              startIcon={<RotateCcw size={14} />}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
            >
              {t('chipClear')}
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => runAnalysis()}
            disabled={!inputText.trim() || isScanning}
            startIcon={<Search size={16} />}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 0.8,
              textTransform: 'none'
            }}
          >
            {isScanning ? t('scanning') : t('scanNowBtn')}
          </Button>
        </Stack>
      </Paper>

      {/* Sample Scam Test Chips */}
      <Box sx={{ mb: 2.5, width: '100%' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
          {t('quickTestChips')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
          {SAMPLE_CHIPS.map((chip) => (
            <Chip
              key={chip.key}
              label={t(chip.key)}
              size="small"
              onClick={() => handleChipSelect(chip.text)}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: '#f1f5f9',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                height: 'auto',
                py: 0.6,
                '&:hover': { bgcolor: '#e2e8f0' },
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  px: 1.2
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Analysis Results Display */}
      {analysisResult && (
        <Box sx={{ mt: 1, width: '100%' }}>
          {(() => {
            const verdict = getVerdictDetails(analysisResult.level);
            return (
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3.5,
                  border: `1.5px solid ${verdict.border}`,
                  bgcolor: verdict.bg,
                  overflow: 'hidden',
                  mb: 2.5,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Verdict Header */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    {verdict.icon}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="h6" sx={{ fontWeight: 800, color: verdict.color, lineHeight: 1.2 }}>
                          {verdict.title}
                        </Typography>
                        <Chip
                          label={`${t('riskScore')}: ${analysisResult.riskScore}/100`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: verdict.color,
                            color: '#ffffff'
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                        {verdict.desc}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Risk Score Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={analysisResult.riskScore}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: verdict.color,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>

                  {/* Detected Reasons */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                    {t('detectionReasons')}:
                  </Typography>
                  <List dense disablePadding sx={{ mb: 2 }}>
                    {analysisResult.reasons.map((reason, idx) => (
                      <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start', py: 0.4 }}>
                        <ListItemIcon sx={{ minWidth: 24, mt: 0.4 }}>
                          {analysisResult.level === 'SAFE' ? (
                            <CheckCircle2 size={16} color="#16a34a" />
                          ) : (
                            <AlertTriangle size={16} color={verdict.color} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={reason}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { color: '#334155', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Extracted URLs */}
                  {analysisResult.urls && analysisResult.urls.length > 0 && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>
                        {t('extractedUrls')}:
                      </Typography>
                      {analysisResult.urls.map((url, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            wordBreak: 'break-all',
                            color: '#2563eb',
                            fontWeight: 600,
                            my: 0.25
                          }}
                        >
                          <LinkIcon size={12} style={{ marginRight: 4, flexShrink: 0 }} /> {url}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* 1-Tap Alert Family Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAlertFamily}
                    startIcon={<Share2 size={18} />}
                    sx={{
                      bgcolor: '#16a34a',
                      '&:hover': { bgcolor: '#15803d' },
                      fontWeight: 800,
                      borderRadius: 2.5,
                      py: 1.2,
                      textTransform: 'none'
                    }}
                  >
                    {t('alertFamilyBtn')}
                  </Button>
                </CardContent>
              </Card>
            );
          })()}
        </Box>
      )}

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
