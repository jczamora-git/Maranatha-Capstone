import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnrollmentStep1Props {
  enrollment: any;
  editedEnrollment: any;
  isEditing: boolean;
  handleFieldChange: (field: string, value: any) => void;
  status: any;
  onComplete: () => void;
}

export function EnrollmentStep1({ 
  enrollment, 
  editedEnrollment, 
  isEditing, 
  handleFieldChange,
  status,
  onComplete
}: EnrollmentStep1Props) {
  return (
    <div className="space-y-6">
      {/* Enrollment Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">School Year</p>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">📅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{enrollment.school_year || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Enrollment Type</p>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-600">🎓</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 line-clamp-2">{enrollment.enrollment_type || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Submitted Date</p>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-600">📝</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{new Date(enrollment.submitted_date).toLocaleDateString() || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Status</p>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                {status.icon && <div className={`text-lg ${status.text}`}>{status.icon}</div>}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{enrollment.status || '—'}</p>
          </div>
        </div>
      </div>

      {(enrollment.approved_date || enrollment.rejection_reason) && (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollment.approved_date && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground font-medium">Approved Date</p>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">✓</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{new Date(enrollment.approved_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {enrollment.rejection_reason && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground font-medium">Rejection Reason</p>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">✕</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{enrollment.rejection_reason}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Student Information</h2>
          <p className="text-blue-100 text-sm mt-1">Basic student details</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">First Name</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="text"
                  value={editedEnrollment.learner_first_name || ''}
                  onChange={(e) => handleFieldChange('learner_first_name', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.learner_first_name || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Middle Name</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="text"
                  value={editedEnrollment.learner_middle_name || ''}
                  onChange={(e) => handleFieldChange('learner_middle_name', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.learner_middle_name || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Last Name</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="text"
                  value={editedEnrollment.learner_last_name || ''}
                  onChange={(e) => handleFieldChange('learner_last_name', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.learner_last_name || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Birth Date</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="date"
                  value={editedEnrollment.birth_date || ''}
                  onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.birth_date ? new Date(enrollment.birth_date).toLocaleDateString() : 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              {isEditing && editedEnrollment ? (
                <select
                  value={editedEnrollment.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={enrollment.gender || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Grade Level</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="text"
                  value={editedEnrollment.grade_level || ''}
                  onChange={(e) => handleFieldChange('grade_level', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.grade_level || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">PSA Cert #</label>
              {isEditing && editedEnrollment ? (
                <input
                  type="text"
                  value={editedEnrollment.psa_birth_cert_number || ''}
                  onChange={(e) => handleFieldChange('psa_birth_cert_number', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={enrollment.psa_birth_cert_number || 'N/A'}
                  disabled
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Address Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Current Address</h2>
          <p className="text-emerald-100 text-sm mt-1">Student's current residence</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700">Street Address</label>
            {isEditing && editedEnrollment ? (
              <input type="text" value={editedEnrollment.current_address || ''} onChange={(e) => handleFieldChange('current_address', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            ) : (
              <input type="text" value={enrollment.current_address || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Province</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.current_province || ''} onChange={(e) => handleFieldChange('current_province', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" value={enrollment.current_province || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Municipality</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.current_municipality || ''} onChange={(e) => handleFieldChange('current_municipality', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" value={enrollment.current_municipality || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Barangay</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.current_barangay || ''} onChange={(e) => handleFieldChange('current_barangay', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" value={enrollment.current_barangay || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Zip Code</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.current_zip_code || ''} onChange={(e) => handleFieldChange('current_zip_code', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" value={enrollment.current_zip_code || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.current_phone || ''} onChange={(e) => handleFieldChange('current_phone', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" value={enrollment.current_phone || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Permanent Address</h2>
          <p className="text-purple-100 text-sm mt-1">Student's permanent residential address</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {isEditing && editedEnrollment ? (
              <>
                <input
                  type="checkbox"
                  id="same-as-current-checkbox"
                  checked={editedEnrollment.same_as_current ? true : false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    handleFieldChange('same_as_current', isChecked ? 1 : 0);
                    
                    // If checked, copy current address to permanent
                    if (isChecked) {
                      handleFieldChange('permanent_address', editedEnrollment.current_address);
                      handleFieldChange('permanent_province', editedEnrollment.current_province);
                      handleFieldChange('permanent_municipality', editedEnrollment.current_municipality);
                      handleFieldChange('permanent_barangay', editedEnrollment.current_barangay);
                      handleFieldChange('permanent_zip_code', editedEnrollment.current_zip_code);
                    }
                  }}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <label htmlFor="same-as-current-checkbox" className="text-sm text-blue-700 font-medium cursor-pointer flex-1">
                  Same as current address
                </label>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={enrollment.same_as_current || !enrollment.permanent_address ? true : false}
                  disabled
                  className="w-5 h-5 text-blue-600 cursor-not-allowed"
                />
                <label className="text-sm text-blue-700 font-medium">
                  {(enrollment.same_as_current || !enrollment.permanent_address) ? '✓ Same as current address' : '○ Different address'}
                </label>
              </>
            )}
          </div>

          {!((isEditing && editedEnrollment ? editedEnrollment.same_as_current : (enrollment.same_as_current || !enrollment.permanent_address))) && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700">Street Address</label>
                {isEditing && editedEnrollment ? (
                  <input
                    type="text"
                    value={editedEnrollment.permanent_address || ''}
                    onChange={(e) => handleFieldChange('permanent_address', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={enrollment.permanent_address || ''}
                    disabled
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Province</label>
                  {isEditing && editedEnrollment ? (
                    <input
                      type="text"
                      value={editedEnrollment.permanent_province || ''}
                      onChange={(e) => handleFieldChange('permanent_province', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={enrollment.permanent_province || ''}
                      disabled
                      className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Municipality</label>
                  {isEditing && editedEnrollment ? (
                    <input
                      type="text"
                      value={editedEnrollment.permanent_municipality || ''}
                      onChange={(e) => handleFieldChange('permanent_municipality', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={enrollment.permanent_municipality || ''}
                      disabled
                      className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Barangay</label>
                  {isEditing && editedEnrollment ? (
                    <input
                      type="text"
                      value={editedEnrollment.permanent_barangay || ''}
                      onChange={(e) => handleFieldChange('permanent_barangay', e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={enrollment.permanent_barangay || ''}
                      disabled
                      className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                {isEditing && editedEnrollment ? (
                  <input
                    type="text"
                    value={editedEnrollment.permanent_zip_code || ''}
                    onChange={(e) => handleFieldChange('permanent_zip_code', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={enrollment.permanent_zip_code || ''}
                    disabled
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Parent/Guardian Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Parent/Guardian Information</h2>
          <p className="text-amber-100 text-sm mt-1">Contact information for parent or guardian</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Father's Name</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.father_name || ''} onChange={(e) => handleFieldChange('father_name', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
              ) : (
                <input type="text" value={enrollment.father_name || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Mother's Name</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.mother_name || ''} onChange={(e) => handleFieldChange('mother_name', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
              ) : (
                <input type="text" value={enrollment.mother_name || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Father's Contact</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.father_contact || ''} onChange={(e) => handleFieldChange('father_contact', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
              ) : (
                <input type="text" value={enrollment.father_contact || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Mother's Contact</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.mother_contact || ''} onChange={(e) => handleFieldChange('mother_contact', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
              ) : (
                <input type="text" value={enrollment.mother_contact || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Father's Email</label>
              {isEditing && editedEnrollment ? (
                <input type="email" value={editedEnrollment.father_email || ''} onChange={(e) => handleFieldChange('father_email', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
              ) : (
                <input type="email" value={enrollment.father_email || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed text-sm" />
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Mother's Email</label>
              {isEditing && editedEnrollment ? (
                <input type="email" value={editedEnrollment.mother_email || ''} onChange={(e) => handleFieldChange('mother_email', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
              ) : (
                <input type="email" value={enrollment.mother_email || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed text-sm" />
              )}
            </div>
          </div>

          {/* Guardian Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Legal Guardian (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">Fill in if different from parents or if guardian has primary responsibility</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Guardian's Name</label>
                {isEditing && editedEnrollment ? (
                  <input type="text" value={editedEnrollment.guardian_name || ''} onChange={(e) => handleFieldChange('guardian_name', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Full name" />
                ) : (
                  <input type="text" value={enrollment.guardian_name || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Guardian's Contact</label>
                {isEditing && editedEnrollment ? (
                  <input type="text" value={editedEnrollment.guardian_contact || ''} onChange={(e) => handleFieldChange('guardian_contact', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Phone number" />
                ) : (
                  <input type="text" value={enrollment.guardian_contact || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Guardian's Email</label>
                {isEditing && editedEnrollment ? (
                  <input type="email" value={editedEnrollment.guardian_email || ''} onChange={(e) => handleFieldChange('guardian_email', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="email@example.com" />
                ) : (
                  <input type="email" value={enrollment.guardian_email || 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Special Information</h2>
          <p className="text-pink-100 text-sm mt-1">Additional student details</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 border border-gray-200 rounded-lg flex items-center gap-3 transition-opacity ${!(isEditing && editedEnrollment ? editedEnrollment.is_returning_student : enrollment.is_returning_student) ? 'opacity-50' : ''}`}>
              {isEditing && editedEnrollment ? (
                <>
                  <input type="checkbox" checked={editedEnrollment.is_returning_student ? true : false} onChange={(e) => handleFieldChange('is_returning_student', e.target.checked ? 1 : 0)} className="w-5 h-5 text-pink-600 cursor-pointer" />
                  <label className="text-sm text-gray-700 font-medium cursor-pointer">Returning Student</label>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={enrollment.is_returning_student ? true : false} disabled className="w-5 h-5 text-pink-600 cursor-not-allowed" />
                  <p className="text-sm font-medium text-gray-700">Returning Student</p>
                </>
              )}
            </div>
            <div className={`p-4 border border-gray-200 rounded-lg flex items-center gap-3 transition-opacity ${!(isEditing && editedEnrollment ? editedEnrollment.is_indigenous_ip : enrollment.is_indigenous_ip) ? 'opacity-50' : ''}`}>
              {isEditing && editedEnrollment ? (
                <>
                  <input type="checkbox" checked={editedEnrollment.is_indigenous_ip ? true : false} onChange={(e) => handleFieldChange('is_indigenous_ip', e.target.checked ? 1 : 0)} className="w-5 h-5 text-pink-600 cursor-pointer" />
                  <label className="text-sm text-gray-700 font-medium cursor-pointer">Indigenous/IP</label>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={enrollment.is_indigenous_ip ? true : false} disabled className="w-5 h-5 text-pink-600 cursor-not-allowed" />
                  <p className="text-sm font-medium text-gray-700">Indigenous/IP</p>
                </>
              )}
            </div>
            <div className={`p-4 border border-gray-200 rounded-lg flex items-center gap-3 transition-opacity ${!(isEditing && editedEnrollment ? editedEnrollment.is_4ps_beneficiary : enrollment.is_4ps_beneficiary) ? 'opacity-50' : ''}`}>
              {isEditing && editedEnrollment ? (
                <>
                  <input type="checkbox" checked={editedEnrollment.is_4ps_beneficiary ? true : false} onChange={(e) => handleFieldChange('is_4ps_beneficiary', e.target.checked ? 1 : 0)} className="w-5 h-5 text-pink-600 cursor-pointer" />
                  <label className="text-sm text-gray-700 font-medium cursor-pointer">4Ps Beneficiary</label>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={enrollment.is_4ps_beneficiary ? true : false} disabled className="w-5 h-5 text-pink-600 cursor-not-allowed" />
                  <p className="text-sm font-medium text-gray-700">4Ps Beneficiary</p>
                </>
              )}
            </div>
            <div className={`p-4 border border-gray-200 rounded-lg flex items-center gap-3 transition-opacity ${!(isEditing && editedEnrollment ? editedEnrollment.has_disability : enrollment.has_disability) ? 'opacity-50' : ''}`}>
              {isEditing && editedEnrollment ? (
                <>
                  <input type="checkbox" checked={editedEnrollment.has_disability ? true : false} onChange={(e) => handleFieldChange('has_disability', e.target.checked ? 1 : 0)} className="w-5 h-5 text-pink-600 cursor-pointer" />
                  <label className="text-sm text-gray-700 font-medium cursor-pointer">Has Disability</label>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={enrollment.has_disability ? true : false} disabled className="w-5 h-5 text-pink-600 cursor-not-allowed" />
                  <p className="text-sm font-medium text-gray-700">Has Disability</p>
                </>
              )}
            </div>
          </div>

          {!!(isEditing && editedEnrollment ? editedEnrollment.has_disability : enrollment.has_disability) && (
            <div>
              <label className="text-sm font-semibold text-gray-700">Disability Type</label>
              {isEditing && editedEnrollment ? (
                <input type="text" value={editedEnrollment.disability_type && editedEnrollment.disability_type !== '0' ? editedEnrollment.disability_type : ''} onChange={(e) => handleFieldChange('disability_type', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter disability type" />
              ) : (
                <input type="text" value={enrollment.disability_type && enrollment.disability_type !== '0' ? enrollment.disability_type : 'N/A'} disabled className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Complete Step 1 Button */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900 text-lg">Enrollment information review complete?</p>
            <p className="text-sm text-blue-700 mt-1">Click to confirm and proceed to document verification.</p>
          </div>
          <Button
            onClick={onComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-base"
          >
            Mark Complete → Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}
