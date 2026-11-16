import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Users,
  Globe,
  Lock,
  Fingerprint,
  Edit3,
  Shield,
  User,
  Award,
  Zap,
  X
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import {
  getUserProfile,
  updateUserProfile,
  isAppLockActive,
  isBiometricActive,
  updateSecuritySettings,
  logoutUser,
  subscribeAuthState
} from '../services/authService';
import { isProUser } from '../services/adService';

const AVATAR_ICONS = [
  { id: 'shield', label: 'Shield', Icon: Shield },
  { id: 'user', label: 'User', Icon: User },
  { id: 'lock', label: 'Lock', Icon: Lock },
  { id: 'award', label: 'Award', Icon: Award },
  { id: 'zap', label: 'Zap', Icon: Zap }
];

const AVATAR_COLORS = [
  '#38bdf8', // Sky
  '#22c55e', // Emerald
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#f43f5e'  // Rose
];

export default function SettingsScreen({
  lang,
  onLanguageChange,
  onLockApp
}) {
  const [profile, setProfile] = useState(() => getUserProfile() || { name: 'Kavach User', phone: '', avatarIcon: 'shield', avatarColor: '#38bdf8' });
  const [contact1, setContact1] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kavach_family_contacts') || '[]');
      return saved[0] || '';
    } catch {
      return '';
    }
  });
  const [contact2, setContact2] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kavach_family_contacts') || '[]');
      return saved[1] || '';
    } catch {
      return '';
    }
  });

  // Edit Profile Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editIcon, setEditIcon] = useState(profile.avatarIcon || 'shield');
  const [editColor, setEditColor] = useState(profile.avatarColor || '#38bdf8');

  // Security Toggles
  const [appLockEnabled, setAppLockEnabled] = useState(() => isAppLockActive());
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => isBiometricActive());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((state) => {
      if (state.profile) {
        setProfile(state.profile);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenEditDialog = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditIcon(profile.avatarIcon || 'shield');
    setEditColor(profile.avatarColor || '#38bdf8');
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a name.', severity: 'error' });
      return;
    }

    const res = updateUserProfile({
      name: editName,
      phone: editPhone,
      avatarIcon: editIcon,
      avatarColor: editColor
    });

    if (res.success) {
      setProfile(res.profile);
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    }
  };

  const handleSaveContacts = () => {
    const cleaned1 = contact1.replace(/[^0-9]/g, '');
    const cleaned2 = contact2.replace(/[^0-9]/g, '');

    if (cleaned1 && cleaned1.length < 10) {
      setSnackbar({ open: true, message: t('invalidPhoneMsg'), severity: 'error' });
      return;
    }

    const contactsToSave = [];
    if (cleaned1) contactsToSave.push(cleaned1);
    if (cleaned2) contactsToSave.push(cleaned2);

    try {
      localStorage.setItem('kavach_family_contacts', JSON.stringify(contactsToSave));
      setSnackbar({ open: true, message: t('contactsSavedMsg'), severity: 'success' });
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const handleToggleAppLock = (checked) => {
    setAppLockEnabled(checked);
    updateSecuritySettings({ enableAppLock: checked });
    setSnackbar({
      open: true,
      message: checked ? 'App Lock enabled on launch.' : 'App Lock disabled.',
      severity: 'info'
    });
  };

  const handleToggleBiometrics = (checked) => {
    setBiometricsEnabled(checked);
    updateSecuritySettings({ enableBiometrics: checked });
    setSnackbar({
      open: true,
      message: checked ? 'Fingerprint unlock enabled.' : 'Fingerprint unlock disabled.',
      severity: 'info'
    });
  };

  const handleResetProfile = () => {
    if (window.confirm('Reset your security profile and PIN? All settings will be reset.')) {
      logoutUser();
      setSnackbar({ open: true, message: 'Security profile cleared.', severity: 'info' });
    }
  };

  const CurrentIconComponent = AVATAR_ICONS.find(a => a.id === profile.avatarIcon)?.Icon || Shield;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden', pb: 4 }}>
      {/* 1. User Profile & Profile Icon Section */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          borderRadius: 3.5,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          mb: 2.5
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Avatar Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: profile.avatarColor || '#38bdf8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px -4px ${profile.avatarColor || '#38bdf8'}80`,
              flexShrink: 0
            }}
          >
            <CurrentIconComponent size={28} />
          </Box>

          {/* Profile Name & Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {profile.name}
              </Typography>
              {isProUser() && (
                <Chip
                  label="PRO"
                  size="small"
                  sx={{
                    bgcolor: '#fbbf24',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    height: 18
                  }}
                />
              )}
            </Stack>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              {profile.phone ? `+91 ${profile.phone}` : 'Security Profile Active'}
            </Typography>

            <Stack direction="row" spacing={0.8} sx={{ mt: 1 }}>
              <Chip
                label="PIN Protected"
                size="small"
                sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20, bgcolor: '#f1f5f9', color: '#334155' }}
              />
              {biometricsEnabled && (
                <Chip
                  label="Fingerprint On"
                  size="small"
                  sx={{ fontSize: '0.65rem', fontWeight: 600, height: 20, bgcolor: '#ecfdf5', color: '#15803d' }}
                />
              )}
            </Stack>
          </Box>

          {/* Edit Profile Button */}
          <IconButton
            onClick={handleOpenEditDialog}
            sx={{
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0' },
              color: '#0f172a',
              p: 1
            }}
          >
            <Edit3 size={18} />
          </IconButton>
        </Stack>
      </Paper>

      {/* Edit Profile & Icon Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ px: 2, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Edit Profile & Avatar
          </Typography>
          <IconButton size="small" onClick={() => setEditDialogOpen(false)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={2.5}>
            {/* Avatar Preview */}
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: editColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: `0 8px 16px -4px ${editColor}80`
                }}
              >
                {(() => {
                  const IconComp = AVATAR_ICONS.find(a => a.id === editIcon)?.Icon || Shield;
                  return <IconComp size={32} />;
                })()}
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Select your preferred icon and color theme
              </Typography>
            </Box>

            {/* Choose Icon */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                Choose Profile Icon:
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                {AVATAR_ICONS.map(({ id, Icon }) => (
                  <Box
                    key={id}
                    onClick={() => setEditIcon(id)}
                    sx={{
                      p: 1.2,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: editIcon === id ? editColor : '#e2e8f0',
                      bgcolor: editIcon === id ? `${editColor}15` : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} color={editIcon === id ? editColor : '#64748b'} />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Choose Color */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                Choose Avatar Color:
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                {AVATAR_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setEditColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      border: '3px solid',
                      borderColor: editColor === color ? '#0f172a' : 'transparent',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Name Input */}
            <TextField
              size="small"
              label="Your Name"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            {/* Phone Input */}
            <TextField
              size="small"
              label="Mobile Number"
              fullWidth
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Language Toggle */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Globe size={18} color="#2563eb" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {t('languageSectionTitle')}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant={lang === 'en' ? 'contained' : 'outlined'}
            onClick={() => onLanguageChange('en')}
            sx={{
              flex: 1,
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: lang === 'en' ? '#0f172a' : 'transparent',
              borderColor: '#cbd5e1',
              color: lang === 'en' ? '#ffffff' : '#475569'
            }}
          >
            English
          </Button>
          <Button
            variant={lang === 'ta' ? 'contained' : 'outlined'}
            onClick={() => onLanguageChange('ta')}
            sx={{
              flex: 1,
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: lang === 'ta' ? '#0f172a' : 'transparent',
              borderColor: '#cbd5e1',
              color: lang === 'ta' ? '#ffffff' : '#475569'
            }}
          >
            தமிழ் (Tamil)
          </Button>
        </Stack>
      </Paper>

      {/* 3. Security & App Lock Card */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Fingerprint size={18} color="#0284c7" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {t('securitySectionTitle')}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
          {t('securitySectionDesc')}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={appLockEnabled}
                onChange={(e) => handleToggleAppLock(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {t('appLockToggleLabel')}
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={biometricsEnabled}
                onChange={(e) => handleToggleBiometrics(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                {t('biometricToggleLabel')}
              </Typography>
            }
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={onLockApp}
            startIcon={<Lock size={14} />}
            sx={{ flex: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Lock App Now
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleResetProfile}
            sx={{ color: '#dc2626', textTransform: 'none', fontWeight: 600 }}
          >
            Reset PIN
          </Button>
        </Stack>
      </Paper>

      {/* 4. Trusted Family Emergency Contacts */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Users size={18} color="#16a34a" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {t('familyContactsTitle')}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
          {t('familyContactsDesc')}
        </Typography>

        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            label={t('contact1Label')}
            placeholder={t('contact1Placeholder')}
            variant="outlined"
            size="small"
            fullWidth
            value={contact1}
            onChange={(e) => setContact1(e.target.value)}
          />
          <TextField
            label={t('contact2Label')}
            placeholder={t('contact2Placeholder')}
            variant="outlined"
            size="small"
            fullWidth
            value={contact2}
            onChange={(e) => setContact2(e.target.value)}
          />
        </Stack>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSaveContacts}
          sx={{
            bgcolor: '#0f172a',
            '&:hover': { bgcolor: '#1e293b' },
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          {t('saveContactsBtn')}
        </Button>
      </Paper>

      {/* 5. Privacy Guarantee Footer */}
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
