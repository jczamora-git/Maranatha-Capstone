import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronRight, ChevronLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RegisterFormData {
  childFirstName: string;
  childMiddleName: string;
  childLastName: string;
  parentEmail: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { register, login, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    childFirstName: "",
    childMiddleName: "",
    childLastName: "",
    parentEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/enrollee/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.childFirstName.trim()) {
      newErrors.childFirstName = "Child's first name is required";
    }

    if (!formData.childLastName.trim()) {
      newErrors.childLastName = "Child's last name is required";
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Restrict signup to allowed email domains
    const allowedDomains = ["@gmail.com", "@yahoo.com"];
    const emailToCheck = formData.parentEmail.trim().toLowerCase();
    const domainAllowed = allowedDomains.some((d) => emailToCheck.endsWith(d));
    if (formData.parentEmail && !domainAllowed) {
      newErrors.parentEmail = "Please use @gmail.com or @yahoo.com email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register as enrollee
      const result = await register(
        formData.parentEmail,
        formData.password,
        formData.childFirstName,
        formData.childLastName,
        "enrollee"
      );

      if (result && result.success) {
        // Auto-login after successful registration
        const loginSuccess = await login(formData.parentEmail, formData.password);

        if (loginSuccess) {
          toast.success("Account created successfully!");
          // useEffect will handle redirect to /enrollee/dashboard
        } else {
          toast.error("Account created but auto-login failed. Please log in manually.");
          navigate("/auth");
        }
      } else {
        toast.error(result?.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section - Logo */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-10 mb-8 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4">
              <img src={`${import.meta.env.BASE_URL}school-logo.png`} alt="Maranatha Christian Academy" className="h-16 object-contain" />
              <div className="text-left">
                <p className="text-white text-3xl font-extrabold" style={{ fontFamily: 'Montserrat' }}>Maranatha Christian Academy</p>
                <p className="text-white text-lg font-medium" style={{ fontFamily: 'Montserrat' }}>Foundation Calapan City Inc.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-2 bg-white rounded-full overflow-hidden shadow-sm">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-700 w-full"></div>
        </div>

        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-0 shadow-md mb-6">
          <CardContent className="p-8">
            <h2 className="text-center text-2xl font-bold text-gray-800">Enroll Your Child Now</h2>
            <p className="text-center text-gray-700 text-base mt-2">Create account for your child and start journey with us</p>
          </CardContent>
        </Card>

        {/* Info Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Child Information Box */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Child Information</h3>
                <p className="text-gray-600 text-sm mt-1">Enter your child's basic details</p>
              </div>
            </div>
          </div>

          {/* Account Setup Box */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Secure Account</h3>
                <p className="text-gray-600 text-sm mt-1">Create your login credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-10">
            {/* Blue Section Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-10 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Account Setup</h3>
                  <p className="text-blue-100 text-sm mt-1">Fill in your information to get started</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* General error message */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-red-800 font-medium">
                    Please check the form for errors
                  </AlertDescription>
                </Alert>
              )}

              {/* Child's First Name */}
              <div className="space-y-3">
                <Label htmlFor="childFirstName" className="text-base font-bold text-gray-800">Child's First Name *</Label>
                <Input
                  id="childFirstName"
                  type="text"
                  placeholder="e.g., Juan"
                  value={formData.childFirstName}
                  onChange={(e) => handleInputChange("childFirstName", e.target.value)}
                  className={`h-12 text-base ${errors.childFirstName ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.childFirstName && (
                  <p className="text-sm text-red-600 font-medium">{errors.childFirstName}</p>
                )}
              </div>

              {/* Child's Middle Name (optional) */}
              <div className="space-y-3">
                <Label htmlFor="childMiddleName" className="text-base font-bold text-gray-800">Child's Middle Name (optional)</Label>
                <Input
                  id="childMiddleName"
                  type="text"
                  placeholder="e.g., Santos"
                  value={formData.childMiddleName}
                  onChange={(e) => handleInputChange("childMiddleName", e.target.value)}
                  className={`h-12 text-base ${errors.childMiddleName ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.childMiddleName && (
                  <p className="text-sm text-red-600 font-medium">{errors.childMiddleName}</p>
                )}
              </div>

              {/* Child's Last Name */}
              <div className="space-y-3">
                <Label htmlFor="childLastName" className="text-base font-bold text-gray-800">Child's Last Name *</Label>
                <Input
                  id="childLastName"
                  type="text"
                  placeholder="e.g., Dela Cruz"
                  value={formData.childLastName}
                  onChange={(e) => handleInputChange("childLastName", e.target.value)}
                  className={`h-12 text-base ${errors.childLastName ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.childLastName && (
                  <p className="text-sm text-red-600 font-medium">{errors.childLastName}</p>
                )}
              </div>

              {/* Parent/Guardian Email */}
              <div className="space-y-3">
                <Label htmlFor="parentEmail" className="text-base font-bold text-gray-800">Parent/Guardian Email Address *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  className={`h-12 text-base ${errors.parentEmail ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.parentEmail && (
                  <p className="text-sm text-red-600 font-medium">{errors.parentEmail}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  📧 Use @gmail.com or @yahoo.com - Please ensure this account is active and can receive emails for school updates
                </p>
              </div>

              {/* Account Password */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-bold text-gray-800">Create Account Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`h-12 text-base ${errors.password ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">🔒 Minimum 6 characters recommended</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-bold text-gray-800">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`h-12 text-base ${errors.confirmPassword ? "border-red-500 border-2" : "border-gray-200"}`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-7">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-5 w-5 rounded border border-blue-300 bg-white cursor-pointer accent-blue-600"
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer text-gray-700">
                    I agree to the <span className="font-semibold text-blue-600">Terms of Service</span> and <span className="font-semibold text-blue-600">Privacy Policy</span> of Maranatha Christian Academy
                  </Label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="w-full h-13 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </form>

            <div className="border-t border-gray-200 mt-8 pt-8">
              <p className="text-center text-gray-700">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/auth")}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign In Here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-12 text-center space-y-4 px-6 py-8 bg-white rounded-2xl shadow-md border border-blue-100">
          <p className="text-gray-700 text-base leading-relaxed">
            <span className="font-bold text-blue-600">Maranatha Christian Academy</span> is a private school, non-stock, non-profit, and non-sectarian educational institution that offers transformative quality education aimed at producing empowered and socially-responsible servant-leaders with high regard to their Christian values.
          </p>
          <p className="text-gray-600 text-sm pt-4 border-t border-gray-200">
            Questions? Contact our admissions team at <span className="font-semibold text-blue-600">admissions@mcc.edu.ph</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
