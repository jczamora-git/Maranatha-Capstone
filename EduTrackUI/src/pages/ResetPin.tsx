import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS, apiPost } from '@/lib/api';
import { NumericKeypad } from '@/components/NumericKeypad';

export default function ResetPin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
      toast.error('Invalid or missing reset token');
    }
  }, [token]);

  const handleContinue = () => {
    if (step === 'enter') {
      if (pin.length !== 6) {
        setError('PIN must be exactly 6 digits');
        return;
      }
      setError('');
      setStep('confirm');
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep('enter');
    setConfirmPin('');
    setError('');
  };

  const handlePinChange = (value: string) => {
    if (step === 'enter') {
      setPin(value);
    } else {
      setConfirmPin(value);
    }
    setError('');
  };

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost(API_ENDPOINTS.RESET_PIN, {
        token,
        new_pin: pin,
      });

      if (response.success) {
        toast.success('PIN reset successfully!');
        setTimeout(() => {
          navigate('/auth/');
        }, 1500);
      } else {
        if (response.message?.includes('expired') || response.message?.includes('invalid')) {
          setTokenInvalid(true);
        }
        setError(response.message || 'Failed to reset PIN');
        toast.error(response.message || 'Failed to reset PIN');
      }
    } catch (error: any) {
      console.error('Reset PIN error:', error);
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-4 px-2 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-2xl shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Invalid Reset Link</h1>
            <p className="text-xs text-gray-600 px-2">
              This PIN reset link is invalid or has expired
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-4 pb-4 px-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">
                <p className="text-[11px] leading-tight text-red-700">
                  Reset links expire after 24 hours for security reasons. Please request a new PIN reset.
                </p>
              </div>

              <div className="space-y-2">
                <Link to="/auth/forgot-pin" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/auth/login" className="block">
                  <Button variant="outline" className="w-full text-sm">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
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
            {step === 'enter' ? 'Reset Payment PIN' : 'Confirm Your PIN'}
          </h1>
          <p className="text-xs text-gray-600 px-2">
            {step === 'enter' 
              ? 'Enter your new 6-digit PIN'
              : 'Re-enter your 6-digit PIN'
            }
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-4 pb-4 px-3">
            {/* Info Box */}
            {step === 'enter' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                <div className="flex gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-tight text-blue-700">
                    <p className="font-medium">Use a secure PIN</p>
                    <p className="mt-0.5">
                      Avoid obvious numbers. This PIN will be required for all payment transactions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-3 flex gap-1.5 rounded-lg bg-red-50 border border-red-200 p-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight text-red-700">{error}</div>
              </div>
            )}

            {/* Numeric Keypad */}
            <NumericKeypad
              value={step === 'enter' ? pin : confirmPin}
              onChange={handlePinChange}
              maxLength={6}
              onSubmit={handleContinue}
              disabled={isSubmitting}
            />

            {/* Back Button (only on confirm step) */}
            {step === 'confirm' && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back to Enter PIN
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        {step === 'enter' && (
          <div className="mt-3 bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-900 mb-1.5">Security Tips:</p>
            <ul className="text-[10px] leading-tight text-gray-600 space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Avoid obvious numbers like 123456</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Don't share with anyone</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Choose memorable numbers</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
