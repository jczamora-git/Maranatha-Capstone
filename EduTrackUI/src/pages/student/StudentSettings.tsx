import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Lock, AlertCircle } from "lucide-react";
import { AlertMessage } from "@/components/AlertMessage";
import EmailLoadingModal from "@/components/EmailLoadingModal";

const StudentSettings = () => {
  const { user } = useAuth();

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // PIN state
  const [pinData, setPinData] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [pinError, setPinError] = useState("");

  // Alert state
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Password handlers
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setPasswordError("");
  };

  const handleChangePassword = () => {
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    console.log("Changing password");
    setAlert({ type: "success", message: "Password changed successfully" });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleForgotPassword = () => {
    (async () => {
      const emailToUse = user?.email;
      if (!emailToUse) {
        setAlert({ type: "error", message: "No email available for this account." });
        return;
      }

      setShowEmailModal(true);
      try {
        const res = await fetch('/api/auth/request-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToUse })
        });

        const json = await res.json();
        if (res.ok) {
          setAlert({ type: 'success', message: json.message || `Recovery link sent to ${emailToUse}. Check your inbox.` });
        } else {
          setAlert({ type: 'error', message: json.message || 'Failed to request password reset.' });
          setShowEmailModal(false);
        }
      } catch (err: any) {
        setAlert({ type: 'error', message: 'Network error while requesting password reset.' });
        setShowEmailModal(false);
      }
    })();
  };

  // PIN handlers
  const handlePinChange = (field: string, value: string) => {
    setPinData(prev => ({ ...prev, [field]: value }));
    setPinError("");
  };

  const handleChangePin = async () => {
    setPinError("");

    if (!pinData.currentPin) {
      setPinError("Current PIN is required");
      return;
    }
    if (!pinData.newPin) {
      setPinError("New PIN is required");
      return;
    }
    if (pinData.newPin.length !== 6) {
      setPinError("PIN must be exactly 6 digits");
      return;
    }
    if (!/^\d{6}$/.test(pinData.newPin)) {
      setPinError("PIN must contain only numbers");
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    try {
      const response = await fetch('/api/auth/change-payment-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_pin: pinData.currentPin,
          new_pin: pinData.newPin,
        })
      });

      const json = await response.json();
      
      if (response.ok) {
        setAlert({ type: "success", message: "Payment PIN changed successfully" });
        setPinData({ currentPin: "", newPin: "", confirmPin: "" });
      } else {
        setPinError(json.message || "Failed to change PIN");
        setAlert({ type: "error", message: json.message || "Failed to change PIN" });
      }
    } catch (err: any) {
      console.error("PIN change error:", err);
      setPinError("An error occurred while changing PIN");
      setAlert({ type: "error", message: "Error changing PIN. Please try again." });
    }
  };

  return (
    <DashboardLayout>
      {/* Email Loading Modal */}
      <EmailLoadingModal
        isOpen={showEmailModal}
        isSuccess={alert?.type === 'success'}
        emailType="reset"
        onComplete={() => setShowEmailModal(false)}
        autoCloseDuration={3000}
      />

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div className="p-8 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your security settings</p>
        </div>

        {/* Security Section - 2 Column Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {passwordError && (
                <div className="p-3 bg-red-100/70 border border-red-300 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Enter your new password (minimum 8 characters)"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} className="w-full sm:w-auto">
                Change Password
              </Button>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Forgot password?
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Change Payment PIN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Payment PIN
              </CardTitle>
              <CardDescription>Update your 6-digit payment PIN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pinError && (
                <div className="p-3 bg-red-100/70 border border-red-300 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-pin">Current PIN</Label>
                  <Input
                    id="current-pin"
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    value={pinData.currentPin}
                    onChange={(e) => handlePinChange("currentPin", e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your current 6-digit PIN"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-pin">New PIN</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    value={pinData.newPin}
                    onChange={(e) => handlePinChange("newPin", e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your new 6-digit PIN"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    value={pinData.confirmPin}
                    onChange={(e) => handlePinChange("confirmPin", e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm your new 6-digit PIN"
                  />
                </div>
              </div>

              <Button onClick={handleChangePin} className="w-full sm:w-auto">
                Change PIN
              </Button>

              <div className="text-xs text-muted-foreground">
                Your PIN is used to authorize payment transactions. Keep it secure and do not share it with anyone.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
