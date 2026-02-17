import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { EnrollmentFormData } from "../EnrollmentForm";

interface Step7Props {
  formData: EnrollmentFormData;
  updateFormData: (updates: Partial<EnrollmentFormData>) => void;
  errors: Record<string, string>;
  isReturningStudent?: boolean;
}

const Step7ReviewSubmit = ({ formData, updateFormData, errors, isReturningStudent = false }: Step7Props) => {
  // Tour State
  const [runTour, setRunTour] = useState(false);

  const reviewSubmitTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">📋 Final Review & Submit</h3>
          <p>Please carefully review all your enrollment information before submitting.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.student-info',
      content: 'Review your student information to ensure all details are correct.',
    },
    {
      target: '.address-info',
      content: 'Check your address information for accuracy.',
    },
    {
      target: '.parent-guardian-info',
      content: 'Verify parent/guardian contact information is complete and current.',
    },
    ...(formData.enrollment_type === 'Continuing Student' ? [
      {
        target: '.bg-green-50',
        content: 'Your documents are already on file from previous enrollment.',
      },
    ] : [
      {
        target: '.documents-info',
        content: 'Review the documents you\'ve uploaded or plan to submit physically.',
      },
    ]),
    {
      target: '.bg-amber-50',
      content: 'Please read and agree to the terms and conditions before submitting.',
    },
    {
      target: 'input[type="checkbox"]',
      content: 'Check this box to confirm you agree to all terms and conditions.',
    },
    {
      target: '.bg-blue-50',
      content: 'Final reminder: review everything carefully before submitting your enrollment.',
    },
  ];

  useEffect(() => {
    // Auto start tour for step 7
    const hasSeenTour = localStorage.getItem('reviewSubmitTourCompleted');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('reviewSubmitTourCompleted', 'true');
    }
  };
  return (
    <div className="space-y-6">
      <p className="text-gray-600">Please review all information before submitting your enrollment application.</p>

      {isReturningStudent && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You are re-enrolling for <strong>{formData.grade_level}</strong>. Your enrollment type has been automatically set to <Badge className="bg-green-600 text-white ml-1">{formData.enrollment_type}</Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Student Information Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm student-info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Full Name</p>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {formData.learner_first_name} {formData.learner_middle_name} {formData.learner_last_name}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Birth Date</p>
              <p className="font-semibold text-gray-900">{formData.birth_date}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-semibold text-gray-900">{formData.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Grade Level</p>
              <p className="font-semibold text-gray-900">{formData.grade_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm address-info">
          <div>
            <p className="text-gray-600">Current Address</p>
            <p className="font-semibold text-gray-900">
              {formData.current_address}, {formData.current_municipality}, {formData.current_province} {formData.current_zip_code}
            </p>
          </div>
          {!formData.same_as_current && (
            <div>
              <p className="text-gray-600">Permanent Address</p>
              <p className="font-semibold text-gray-900">
                {formData.permanent_address}, {formData.permanent_municipality}, {formData.permanent_province} {formData.permanent_zip_code}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent/Guardian Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parent/Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm parent-guardian-info">
          {formData.father_name && (
            <div className="border-t pt-4 first:border-t-0 first:pt-0">
              <p className="text-gray-600 font-semibold">Father</p>
              <p className="font-semibold text-gray-900">{formData.father_name}</p>
              <p className="text-gray-600">{formData.father_contact}</p>
              <p className="text-gray-600">{formData.father_email}</p>
            </div>
          )}
          {formData.mother_name && (
            <div className="border-t pt-4">
              <p className="text-gray-600 font-semibold">Mother</p>
              <p className="font-semibold text-gray-900">{formData.mother_name}</p>
              <p className="text-gray-600">{formData.mother_contact}</p>
              <p className="text-gray-600">{formData.mother_email}</p>
            </div>
          )}
          {formData.guardian_name && (
            <div className="border-t pt-4">
              <p className="text-gray-600 font-semibold">Guardian</p>
              <p className="font-semibold text-gray-900">{formData.guardian_name}</p>
              <p className="text-gray-600">{formData.guardian_contact}</p>
              <p className="text-gray-600">{formData.guardian_email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Information Review */}
      {(formData.enrollment_type || formData.is_indigenous_ip || formData.is_4ps_beneficiary || formData.has_disability) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Special Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm special-info">
            {formData.enrollment_type && (
              <p className="text-gray-900">
                <strong>✓ Enrollment Type:</strong> {formData.enrollment_type}
              </p>
            )}
            {formData.is_indigenous_ip && (
              <p className="text-gray-900">
                <strong>✓ Indigenous Peoples Member</strong>
              </p>
            )}
            {formData.is_4ps_beneficiary && (
              <p className="text-gray-900">
                <strong>✓ 4Ps Beneficiary</strong>
              </p>
            )}
            {formData.has_disability && (
              <p className="text-gray-900">
                <strong>✓ Learner with Disability</strong> - {formData.disability_type}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents Review - Different for Continuing vs Returning Students */}
      {formData.enrollment_type === 'Continuing Student' ? (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-base text-green-900">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm documents-info">
            <p className="text-green-800">
              <strong>✓ Documents on File</strong> - Your academic documents from previous years are already on file and do not need to be re-uploaded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents Uploaded ({formData.documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {formData.documents.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {formData.documents.map((doc, index) => (
                  <li key={index} className="text-gray-900">
                    {doc.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-700">
                {formData.enrollment_type === 'Returning Student' 
                  ? "No documents uploaded. Please add updated documents or confirm physical submission."
                  : "No documents uploaded. Please add documents before submitting."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base text-amber-900">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded border border-amber-200 text-sm text-gray-700 max-h-48 overflow-y-auto">
            <p className="mb-4">
              By submitting this enrollment application, you agree to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                All information provided is accurate and truthful to the best of your knowledge.
              </li>
              <li>
                You grant Maranatha Preschool & Elementary School permission to contact you using the phone numbers and email addresses provided.
              </li>
              <li>
                You agree to the school's policies and procedures as outlined in the Parent-Student Handbook.
              </li>
              <li>
                You understand that enrollment is subject to approval by the school administration.
              </li>
              <li>
                All documents submitted will be kept confidential and used only for school purposes.
              </li>
              <li>
                The school may request additional documents or information to complete the enrollment process.
              </li>
              <li>
                You understand the school's fee structure and payment terms for the school year.
              </li>
              <li>
                You agree to comply with the school's attendance and academic performance standards.
              </li>
            </ul>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeTerms"
              checked={formData.agreed_to_terms}
              onCheckedChange={(checked) => updateFormData({ agreed_to_terms: checked as boolean })}
            />
            <Label htmlFor="agreeTerms" className="text-gray-800 cursor-pointer font-semibold">
              I agree to all terms and conditions above and certify that all information provided is accurate.
            </Label>
          </div>

          {errors.agreed_to_terms && <p className="text-red-600 text-sm">{errors.agreed_to_terms}</p>}
        </CardContent>
      </Card>

      {/* Final Review Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please review all information carefully. Once submitted, you'll receive a confirmation email with your enrollment ID and status tracking information.
        </AlertDescription>
      </Alert>

      <Joyride
        steps={reviewSubmitTourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 1000,
          },
        }}
        locale={{
          last: 'Finish',
          skip: 'Skip',
        }}
      />
    </div>
  );
};

export default Step7ReviewSubmit;
