import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePaymentPageLock } from '@/hooks/usePaymentPageLock';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS, apiPost } from '@/lib/api';
import { NumericKeypad } from '@/components/NumericKeypad';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function VerifyPin() {
  const navigate = useNavigate();
  const { unlockPaymentSection, navigateToPayment } = usePaymentPageLock();
  
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleVerify = async () => {
    if (pin.length !== 6) {
      setError('Please enter your complete 6-digit PIN');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    console.log('🔐 [VerifyPin] Attempting to verify PIN...');

    try {
      const response = await apiPost(API_ENDPOINTS.VERIFY_PAYMENT_PIN, {
        payment_pin: pin,
      });

      if (response.success) {
        console.log('🔐 [VerifyPin] PIN verified successfully!');
        toast.success('PIN verified successfully');
        setPin('');
        setAttempts(0);
        setError('');
        unlockPaymentSection();
        navigateToPayment();
      } else {
        console.log('🔐 [VerifyPin] PIN verification failed:', { response });
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          setError('Too many failed attempts. Please reset your PIN.');
          toast.error('Account temporarily locked for security.');
          setPin('');
        } else {
          const remaining = maxAttempts - newAttempts;
          setError(`Incorrect PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
          toast.error('Incorrect PIN');
          setPin('');
        }
      }
    } catch (err: any) {
      console.error('🔐 [VerifyPin] PIN verification error:', err);
      setError('An error occurred. Please try again.');
      toast.error('Error verifying PIN');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    setError('');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center py-4 px-2 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-2xl shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Verify Payment PIN
            </h1>
            <p className="text-xs text-gray-600 px-2">
              Enter your 6-digit PIN
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-4 pb-4 px-3">
              {/* Error Message */}
              {error && (
                <div className="mb-3 flex gap-1.5 rounded-lg bg-red-50 border border-red-200 p-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-tight text-red-700">{error}</div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <p className="text-[11px] leading-tight text-blue-700">
                  This is your payment PIN, not your password.
                </p>
              </div>

              {/* Numeric Keypad */}
              <NumericKeypad
                value={pin}
                onChange={handlePinChange}
                maxLength={6}
                onSubmit={handleVerify}
                disabled={isVerifying || attempts >= maxAttempts}
              />

              {/* Forgot PIN Link */}
              <div className="mt-3 text-center">
                <Link
                  to="/auth/forgot-pin"
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  Forgot PIN?
                </Link>
              </div>

              {/* Back Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={isVerifying}
                className="w-full mt-2 text-xs text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Go Back
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-3 text-center text-[10px] text-gray-500">
            PIN required for all payments
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
