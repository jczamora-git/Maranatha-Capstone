import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to manage payment section lock/unlock state
 * Acts like 2FA for the payment pages
 * 
 * Payment section includes:
 * - /enrollment/payment (main page)
 * - /enrollment/installment-plans
 * - /enrollment/payment-process
 * 
 * When user navigates away to non-payment pages, lock resets
 * Coming back to payment requires PIN verification again
 * 
 * Usage:
 * const { isPaymentSectionUnlocked, unlockPaymentSection } = usePaymentPageLock();
 */

const PAYMENT_SECTION_PAGES = [
  '/enrollee/payment',
  '/enrollment/payment',
  '/enrollee/installment-plans',
  '/enrollment/installment-plans',
  '/enrollee/payment-process',
  '/enrollment/payment-process',
];

const PAYMENT_LOCK_KEY = 'payment_section_unlocked';

export function usePaymentPageLock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isPaymentSectionUnlocked, setIsPaymentSectionUnlocked] = useState<boolean | null>(null);
  const previousPathRef = useRef<string | null>(null);

  /**
   * Detect the current route prefix (enrollee or enrollment)
   */
  const getCurrentPrefix = () => {
    if (location.pathname.startsWith('/enrollee/')) return '/enrollee';
    if (location.pathname.startsWith('/enrollment/')) return '/enrollment';
    return '/enrollee'; // default fallback
  };

  /**
   * Check if current page is part of payment section
   */
  const isPaymentSectionPage = () => {
    return PAYMENT_SECTION_PAGES.some(page => location.pathname === page);
  };

  /**
   * Check if previous page was part of payment section
   */
  const wasOnPaymentSection = () => {
    if (!previousPathRef.current) return false;
    return PAYMENT_SECTION_PAGES.some(page => previousPathRef.current === page);
  };

  /**
   * Unlock payment section for user
   */
  const unlockPaymentSection = () => {
    sessionStorage.setItem(PAYMENT_LOCK_KEY, 'true');
    setIsPaymentSectionUnlocked(true);
  };

  /**
   * Lock payment section
   */
  const lockPaymentSection = () => {
    sessionStorage.removeItem(PAYMENT_LOCK_KEY);
    setIsPaymentSectionUnlocked(false);
  };

  /**
   * Navigate to payment section with correct prefix
   */
  const navigateToPayment = () => {
    const prefix = getCurrentPrefix();
    navigate(`${prefix}/payment`, { replace: true });
  };

  /**
   * Navigate to setup-pin with correct prefix
   */
  const navigateToSetupPin = () => {
    const prefix = getCurrentPrefix();
    navigate(`${prefix}/setup-pin`, { replace: true });
  };

  /**
   * Navigate to verify-pin with correct prefix
   */
  const navigateToVerifyPin = () => {
    const prefix = getCurrentPrefix();
    navigate(`${prefix}/verify-pin`, { replace: true });
  };

  /**
   * Check lock status on mount and location change
   */
  useEffect(() => {
    const isCurrentlyUnlocked = sessionStorage.getItem(PAYMENT_LOCK_KEY) === 'true';
    const isCurrentPageInPaymentSection = isPaymentSectionPage();
    const isLeavingPaymentSection = wasOnPaymentSection() && !isCurrentPageInPaymentSection;
    const hasPinSet = user?.payment_pin_set === true;

    console.log('🔐 [usePaymentPageLock] ===== START CHECK =====', {
      currentPath: location.pathname,
      previousPath: previousPathRef.current,
      sessionStorageUnlocked: isCurrentlyUnlocked,
      isPaymentSection: isCurrentPageInPaymentSection,
      isLeavingPaymentSection,
      userExists: !!user,
      userId: user?.id,
      userHasPinSet: hasPinSet,
      userPaymentPinSetValue: user?.payment_pin_set,
    });

    // If leaving payment section (was on payment, now on different section), reset the lock
    if (isLeavingPaymentSection) {
      console.log('🔐 [usePaymentPageLock] Left payment section - resetting lock');
      lockPaymentSection();
      previousPathRef.current = location.pathname;
      return;
    }

    // If trying to access payment section but not unlocked
    if (isCurrentPageInPaymentSection && !isCurrentlyUnlocked) {
      console.log('🔐 [usePaymentPageLock] Payment section locked - user needs verification');
      
      // User has no PIN set - send to setup-pin
      if (!hasPinSet) {
        console.log('🔐 [usePaymentPageLock] ⚠️ NO PIN SET - navigating to setup-pin');
        navigateToSetupPin();
        previousPathRef.current = location.pathname;
        return;
      }
      
      // User has PIN set but not unlocked - send to verify-pin
      console.log('🔐 [usePaymentPageLock] ✅ PIN exists - navigating to verify-pin');
      navigateToVerifyPin();
      previousPathRef.current = location.pathname;
      return;
    }

    // Update state based on current unlock status
    console.log('🔐 [usePaymentPageLock] Updating state: isPaymentSectionUnlocked =', isCurrentlyUnlocked);
    setIsPaymentSectionUnlocked(isCurrentlyUnlocked);
    
    // Update previous path ref for next check
    previousPathRef.current = location.pathname;
    console.log('🔐 [usePaymentPageLock] ===== END CHECK =====');
  }, [location.pathname, navigate, user?.payment_pin_set]);

  return {
    isPaymentSectionUnlocked,
    unlockPaymentSection,
    lockPaymentSection,
    isPaymentSectionPage,
    navigateToPayment,
    navigateToSetupPin,
    navigateToVerifyPin,
    getCurrentPrefix,
  };
}
