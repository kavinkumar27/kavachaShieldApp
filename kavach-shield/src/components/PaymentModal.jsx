import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  Radio,
  TextField,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  X,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Building2,
  Sparkles,
  Lock,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { SUBSCRIPTION_SKUS } from '../services/billingService';
import { hideBannerAd } from '../services/adService';

export default function PaymentModal({
  open,
  onClose,
  initialPlan = SUBSCRIPTION_SKUS.MONTHLY,
  onSuccess
}) {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const isMonthly = selectedPlan === SUBSCRIPTION_SKUS.MONTHLY;
  const amount = isMonthly ? 49 : 299;
  const planName = isMonthly ? 'Kavach Pro - Monthly' : 'Kavach Pro - Yearly (50% Off)';

  const handleProcessPayment = () => {
    setIsProcessing(true);

    // Realistic secure payment simulation
    setTimeout(() => {
      const txId = 'KVCH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const now = new Date();
      const expiry = new Date();
      if (isMonthly) {
        expiry.setMonth(expiry.getMonth() + 1);
      } else {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }

      const receipt = {
        txId,
        amount: `₹${amount}`,
        plan: planName,
        method: paymentMethod.toUpperCase(),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        validUntil: expiry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      try {
        localStorage.setItem('isProUser', 'true');
        localStorage.setItem('kavach_pro_expiry', receipt.validUntil);
        localStorage.setItem('kavach_last_receipt', JSON.stringify(receipt));
      } catch (e) {
        console.warn('Storage error:', e);
      }

      hideBannerAd();
      setReceiptData(receipt);
      setIsProcessing(false);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess(receipt);
      }
    }, 1800);
  };

  const handleFillDemoCard = () => {
    setCardNumber('4532 •••• •••• 8821');
    setCardExpiry('12/28');
    setCardCvv('782');
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: '#ffffff'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#0f172a',
          color: '#ffffff',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 2,
              bgcolor: 'rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} color="#fbbf24" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {isSuccess ? 'Payment Successful' : 'Complete Kavach Pro Purchase'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {isSuccess ? 'Transaction Completed' : 'Encrypted & RBI Guideline Compliant'}
            </Typography>
          </Box>
        </Stack>
        {!isProcessing && (
          <IconButton size="small" onClick={handleClose} sx={{ color: '#94a3b8' }}>
            <X size={20} />
          </IconButton>
        )}
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {isSuccess ? (
          /* Success Receipt Screen */
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 size={40} color="#16a34a" />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              Kavach Pro Activated!
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
              All ads are now permanently removed and priority on-device heuristics are active.
            </Typography>

            {/* Receipt Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                mb: 2.5
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Receipt size={16} color="#0f172a" />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Official Digital Receipt
                </Typography>
              </Stack>
              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Transaction ID:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{receiptData?.txId}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Plan:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{receiptData?.plan}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Amount Paid:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>{receiptData?.amount}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Valid Until:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>{receiptData?.validUntil}</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={handleClose}
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                fontWeight: 800,
                borderRadius: 2.5,
                py: 1.2,
                textTransform: 'none'
              }}
            >
              Done & Return to App
            </Button>
          </Box>
        ) : isProcessing ? (
          /* Processing State */
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={56} sx={{ color: '#0f172a', mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Connecting to Gateway...
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Verifying payment token via 256-bit bank encryption.
            </Typography>
            <Chip
              icon={<Lock size={14} />}
              label="Secured by Kavach Safe Pay"
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }}
            />
          </Box>
        ) : (
          /* Payment Selection Form */
          <Stack spacing={2.5}>
            {/* 1. Plan Selector */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                Select Subscription Duration:
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Paper
                  onClick={() => setSelectedPlan(SUBSCRIPTION_SKUS.MONTHLY)}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isMonthly ? '#0f172a' : '#e2e8f0',
                    bgcolor: isMonthly ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Monthly Plan
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹49
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Renews monthly
                  </Typography>
                </Paper>

                <Paper
                  onClick={() => setSelectedPlan(SUBSCRIPTION_SKUS.YEARLY)}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: !isMonthly ? '#fbbf24' : '#e2e8f0',
                    bgcolor: !isMonthly ? '#fffbeb' : '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: '#fbbf24',
                      color: '#0f172a',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      px: 1,
                      py: 0.2,
                      borderBottomLeftRadius: 6
                    }}
                  >
                    50% OFF
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                    Yearly Plan
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹299
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Best value (₹25/mo)
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            {/* 2. Payment Method Selector */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                Choose Payment Method:
              </Typography>

              <Stack spacing={1}>
                {/* Option 1: UPI */}
                <Paper
                  onClick={() => setPaymentMethod('upi')}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: paymentMethod === 'upi' ? '#0f172a' : '#e2e8f0',
                    bgcolor: paymentMethod === 'upi' ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Smartphone size={18} color="#16a34a" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          Instant UPI (GPay / PhonePe / Paytm)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Zero transaction fee &bull; Instant activation
                        </Typography>
                      </Box>
                    </Stack>
                    <Radio checked={paymentMethod === 'upi'} size="small" />
                  </Stack>

                  {paymentMethod === 'upi' && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Enter UPI ID (e.g. yourname@okhdfcbank)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        sx={{ bgcolor: '#ffffff' }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {['@okhdfcbank', '@oksbi', '@ybl', '@paytm'].map((handle) => (
                          <Chip
                            key={handle}
                            label={handle}
                            size="small"
                            onClick={() => setUpiId(`user${handle}`)}
                            sx={{ fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>

                {/* Option 2: Cards */}
                <Paper
                  onClick={() => setPaymentMethod('card')}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: paymentMethod === 'card' ? '#0f172a' : '#e2e8f0',
                    bgcolor: paymentMethod === 'card' ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <CreditCard size={18} color="#2563eb" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          Credit / Debit Card (RuPay, Visa, Master)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          All Indian bank cards supported
                        </Typography>
                      </Box>
                    </Stack>
                    <Radio checked={paymentMethod === 'card'} size="small" />
                  </Stack>

                  {paymentMethod === 'card' && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            placeholder="CVV"
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            sx={{ flex: 1 }}
                          />
                        </Stack>
                        <Button
                          size="small"
                          variant="text"
                          onClick={handleFillDemoCard}
                          sx={{ alignSelf: 'flex-start', textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Fill Test Demo Card
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Paper>

                {/* Option 3: Net Banking */}
                <Paper
                  onClick={() => setPaymentMethod('netbanking')}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: paymentMethod === 'netbanking' ? '#0f172a' : '#e2e8f0',
                    bgcolor: paymentMethod === 'netbanking' ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Building2 size={18} color="#d97706" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          Net Banking
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          SBI, HDFC, ICICI, Axis & others
                        </Typography>
                      </Box>
                    </Stack>
                    <Radio checked={paymentMethod === 'netbanking'} size="small" />
                  </Stack>

                  {paymentMethod === 'netbanking' && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {[
                          { id: 'sbi', name: 'SBI' },
                          { id: 'hdfc', name: 'HDFC' },
                          { id: 'icici', name: 'ICICI' },
                          { id: 'axis', name: 'Axis Bank' }
                        ].map((bank) => (
                          <Chip
                            key={bank.id}
                            label={bank.name}
                            clickable
                            color={selectedBank === bank.id ? 'primary' : 'default'}
                            onClick={() => setSelectedBank(bank.id)}
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Stack>
            </Box>

            {/* Pay Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleProcessPayment}
              endIcon={<ArrowRight size={18} />}
              sx={{
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' },
                fontWeight: 800,
                borderRadius: 2.5,
                py: 1.4,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Pay ₹{amount} & Activate Kavach Pro
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
