import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  ShieldCheck,
  Fingerprint,
  ArrowRight
} from 'lucide-react';
import {
  getUserProfile,
  isUserRegistered,
  isAppLockActive,
  isBiometricActive,
  registerUser,
  verifyPin,
  unlockWithBiometrics,
  logoutUser
} from '../services/authService';
import { isBiometricAvailable } from '../services/kavachBridge';

export default function AuthModal({
  open,
  onUnlockSuccess
}) {
  const [profile, setProfile] = useState(() => getUserProfile());
  const [mode, setMode] = useState(() => (isUserRegistered() ? 'unlock' : 'register'));
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [enableAppLock, setEnableAppLock] = useState(true);

  // Unlock State
  const [enteredPin, setEnteredPin] = useState('');
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check biometric capability
  useEffect(() => {
    isBiometricAvailable().then((avail) => {
      setHasBiometricHardware(avail);
    });
  }, []);

  const triggerNativeBiometric = useCallback(async () => {
    setErrorMessage('');
    try {
      const res = await unlockWithBiometrics();
      if (res.success) {
        onUnlockSuccess();
      }
    } catch {
      // User can use PIN fallback
    }
  }, [onUnlockSuccess]);

  // Check and trigger biometric unlock automatically on mount if registered and active
  useEffect(() => {
    if (!open) return;

    const currentProfile = getUserProfile();
    const registered = isUserRegistered();
    setProfile(currentProfile);

    if (registered) {
      setMode('unlock');
      if (isAppLockActive() && isBiometricActive()) {
        triggerNativeBiometric();
      }
    } else {
      setMode('register');
    }
  }, [open, triggerNativeBiometric]);

  const handleRegister = () => {
    setErrorMessage('');
    if (!regName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!regPin || regPin.length !== 4) {
      setErrorMessage('Security PIN must be exactly 4 digits.');
      return;
    }
    if (regPin !== regConfirmPin) {
      setErrorMessage('PIN confirmation does not match.');
      return;
    }

    const res = registerUser({
      name: regName,
      phone: regPhone,
      pin: regPin,
      enableBiometrics,
      enableAppLock
    });

    if (res.success) {
      onUnlockSuccess();
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  const handlePinUnlock = () => {
    setErrorMessage('');
    if (enteredPin.length !== 4) {
      setErrorMessage('Please enter your 4-digit PIN.');
      return;
    }

    const valid = verifyPin(enteredPin);
    if (valid) {
      setEnteredPin('');
      onUnlockSuccess();
    } else {
      setErrorMessage('Incorrect Security PIN. Please try again.');
      setEnteredPin('');
    }
  };

  const handleSkipForNow = () => {
    // Guest access for quick testing without PIN lock
    onUnlockSuccess();
  };

  const handleResetAccount = () => {
    if (window.confirm('Reset security profile and PIN? All settings will be reset.')) {
      logoutUser();
      setProfile(null);
      setMode('register');
      setEnteredPin('');
      setErrorMessage('');
    }
  };

  return (
    <Dialog
      open={open}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: '#0b1120',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        {/* App Logo */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#1e293b',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)'
          }}
        >
          <ShieldCheck size={42} color="#38bdf8" />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
          Kavach Shield
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 3 }}>
          {mode === 'unlock' ? 'App Lock Protected' : 'Setup Security & Biometric App Lock'}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, textAlign: 'left' }}>
            {errorMessage}
          </Alert>
        )}

        {mode === 'unlock' ? (
          /* UNLOCK / LOGIN VIEW */
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 0.5 }}>
              Welcome back, {profile?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2.5 }}>
              Enter your 4-digit Security PIN or use Fingerprint
            </Typography>

            {/* PIN Input */}
            <TextField
              type="password"
              inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: 10 } }}
              placeholder="••••"
              fullWidth
              value={enteredPin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setEnteredPin(val);
                if (val.length === 4) {
                  const valid = verifyPin(val);
                  if (valid) {
                    onUnlockSuccess();
                  } else {
                    setErrorMessage('Incorrect Security PIN. Please try again.');
                  }
                }
              }}
              sx={{
                mb: 2,
                bgcolor: '#0f172a',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handlePinUnlock}
              sx={{
                bgcolor: '#38bdf8',
                color: '#0f172a',
                '&:hover': { bgcolor: '#0284c7' },
                fontWeight: 800,
                borderRadius: 2.5,
                py: 1.2,
                mb: 2,
                textTransform: 'none'
              }}
            >
              Unlock with PIN
            </Button>

            {/* Biometric Button */}
            {hasBiometricHardware && isBiometricActive() && (
              <Button
                variant="outlined"
                fullWidth
                onClick={triggerNativeBiometric}
                startIcon={<Fingerprint size={22} color="#4ade80" />}
                sx={{
                  borderColor: '#4ade80',
                  color: '#4ade80',
                  '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.1)', borderColor: '#86efac' },
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.2,
                  mb: 2,
                  textTransform: 'none'
                }}
              >
                Use Fingerprint / Face
              </Button>
            )}

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="text"
                onClick={handleResetAccount}
                sx={{ color: '#94a3b8', textTransform: 'none', fontSize: '0.75rem' }}
              >
                Reset PIN / Profile
              </Button>

              <Button
                size="small"
                variant="text"
                onClick={handleSkipForNow}
                sx={{ color: '#38bdf8', textTransform: 'none', fontSize: '0.75rem' }}
              >
                Skip for now
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* REGISTRATION VIEW */
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              textAlign: 'left'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
              Create Security Account
            </Typography>

            <Stack spacing={1.8} sx={{ mb: 2.5 }}>
              <TextField
                size="small"
                label="Full Name"
                placeholder="e.g. John Doe"
                fullWidth
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                sx={{ bgcolor: '#0f172a', borderRadius: 2, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />

              <TextField
                size="small"
                label="Mobile Phone Number"
                placeholder="e.g. 9876543210"
                fullWidth
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                sx={{ bgcolor: '#0f172a', borderRadius: 2, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />

              <Stack direction="row" spacing={1.5}>
                <TextField
                  size="small"
                  type="password"
                  label="4-Digit PIN"
                  placeholder="••••"
                  inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ flex: 1, bgcolor: '#0f172a', borderRadius: 2, '& .MuiInputBase-input': { color: '#ffffff' } }}
                />

                <TextField
                  size="small"
                  type="password"
                  label="Confirm PIN"
                  placeholder="••••"
                  inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                  value={regConfirmPin}
                  onChange={(e) => setRegConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ flex: 1, bgcolor: '#0f172a', borderRadius: 2, '& .MuiInputBase-input': { color: '#ffffff' } }}
                />
              </Stack>

              {/* Switches */}
              <Box sx={{ pt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableAppLock}
                      onChange={(e) => setEnableAppLock(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                      Enable App Lock on Launch
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableBiometrics}
                      onChange={(e) => setEnableBiometrics(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                      Allow Biometric Unlock (Fingerprint / Face)
                    </Typography>
                  }
                />
              </Box>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              endIcon={<ArrowRight size={18} />}
              sx={{
                bgcolor: '#38bdf8',
                color: '#0f172a',
                '&:hover': { bgcolor: '#0284c7' },
                fontWeight: 800,
                borderRadius: 2.5,
                py: 1.2,
                mb: 1.5,
                textTransform: 'none'
              }}
            >
              Register & Lock App
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={handleSkipForNow}
              sx={{
                color: '#94a3b8',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.8rem'
              }}
            >
              Skip for now (Guest Access)
            </Button>
          </Paper>
        )}
      </Box>
    </Dialog>
  );
}
