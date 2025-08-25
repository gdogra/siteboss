import React, { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ContractorOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (contractorData: any) => void;
}

interface OnboardingData {
  companyInfo: {
    company_name: string;
    business_type: string;
    years_in_business: string;
    license_number: string;
    license_expiry: string;
    insurance_provider: string;
    insurance_amount: string;
    insurance_expiry: string;
  };
  contactInfo: {
    primary_contact: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    website?: string;
  };
  services: {
    specialties: string[];
    service_areas: string[];
    equipment_owned: string[];
    crew_size: string;
    availability: string;
  };
  documents: {
    business_license: File | null;
    insurance_certificate: File | null;
    w9_form: File | null;
    safety_certificate: File | null;
    references: string[];
  };
}

const steps = [
  { id: 1, name: 'Company Information', description: 'Basic business details' },
  { id: 2, name: 'Contact Information', description: 'Address and contact details' },
  { id: 3, name: 'Services & Capabilities', description: 'What services you provide' },
  { id: 4, name: 'Documentation', description: 'Required documents and references' },
  { id: 5, name: 'Review & Submit', description: 'Review all information' }
];

const specialtyOptions = [
  'General Construction', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 
  'Flooring', 'Painting', 'Drywall', 'Concrete', 'Landscaping',
  'Excavation', 'Framing', 'Insulation', 'Windows & Doors', 'Siding'
];

const ContractorOnboarding: React.FC<ContractorOnboardingProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    companyInfo: {
      company_name: '',
      business_type: '',
      years_in_business: '',
      license_number: '',
      license_expiry: '',
      insurance_provider: '',
      insurance_amount: '',
      insurance_expiry: ''
    },
    contactInfo: {
      primary_contact: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      website: ''
    },
    services: {
      specialties: [],
      service_areas: [],
      equipment_owned: [],
      crew_size: '',
      availability: ''
    },
    documents: {
      business_license: null,
      insurance_certificate: null,
      w9_form: null,
      safety_certificate: null,
      references: ['', '', '']
    }
  });

  const handleInputChange = (section: keyof OnboardingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const handleArrayInputChange = (section: keyof OnboardingData, field: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: values
      }
    }));
  };

  const handleReferenceChange = (index: number, value: string) => {
    const newReferences = [...formData.documents.references];
    newReferences[index] = value;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        references: newReferences
      }
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const contractorData = {
      ...formData.companyInfo,
      ...formData.contactInfo,
      specialties: formData.services.specialties,
      service_areas: formData.services.service_areas,
      equipment_owned: formData.services.equipment_owned,
      crew_size: parseInt(formData.services.crew_size),
      availability_status: formData.services.availability,
      status: 'pending',
      rating: 0,
      reviews_count: 0,
      projects_completed: 0,
      total_revenue: 0,
      average_project_value: 0,
      on_time_completion: 0,
      safety_score: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    onComplete(contractorData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Contractor Onboarding</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step.id < currentStep 
                        ? 'bg-green-600' 
                        : step.id === currentStep 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300'
                    }`}>
                      {step.id < currentStep ? (
                        <CheckIcon className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className={`text-sm font-medium ${
                        step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Steps */}
        <div className="min-h-96">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyInfo.company_name}
                    onChange={(e) => handleInputChange('companyInfo', 'company_name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                  <select
                    value={formData.companyInfo.business_type}
                    onChange={(e) => handleInputChange('companyInfo', 'business_type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business *</label>
                  <input
                    type="number"
                    value={formData.companyInfo.years_in_business}
                    onChange={(e) => handleInputChange('companyInfo', 'years_in_business', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <input
                    type="text"
                    value={formData.companyInfo.license_number}
                    onChange={(e) => handleInputChange('companyInfo', 'license_number', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.companyInfo.license_expiry}
                    onChange={(e) => handleInputChange('companyInfo', 'license_expiry', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider *</label>
                  <input
                    type="text"
                    value={formData.companyInfo.insurance_provider}
                    onChange={(e) => handleInputChange('companyInfo', 'insurance_provider', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Amount *</label>
                  <input
                    type="text"
                    value={formData.companyInfo.insurance_amount}
                    onChange={(e) => handleInputChange('companyInfo', 'insurance_amount', e.target.value)}
                    placeholder="e.g., $1,000,000"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.companyInfo.insurance_expiry}
                    onChange={(e) => handleInputChange('companyInfo', 'insurance_expiry', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.primary_contact}
                    onChange={(e) => handleInputChange('contactInfo', 'primary_contact', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.contactInfo.website}
                    onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.address}
                    onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.city}
                    onChange={(e) => handleInputChange('contactInfo', 'city', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.state}
                    onChange={(e) => handleInputChange('contactInfo', 'state', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.zip_code}
                    onChange={(e) => handleInputChange('contactInfo', 'zip_code', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services & Capabilities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Services & Capabilities</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.specialties.includes(specialty)}
                        onChange={(e) => {
                          const newSpecialties = e.target.checked
                            ? [...formData.services.specialties, specialty]
                            : formData.services.specialties.filter(s => s !== specialty);
                          handleArrayInputChange('services', 'specialties', newSpecialties);
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas *</label>
                  <textarea
                    value={formData.services.service_areas.join(', ')}
                    onChange={(e) => handleArrayInputChange('services', 'service_areas', e.target.value.split(', ').filter(Boolean))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="List cities/regions you serve (comma-separated)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Owned</label>
                  <textarea
                    value={formData.services.equipment_owned.join(', ')}
                    onChange={(e) => handleArrayInputChange('services', 'equipment_owned', e.target.value.split(', ').filter(Boolean))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="List major equipment you own (comma-separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typical Crew Size *</label>
                  <input
                    type="number"
                    value={formData.services.crew_size}
                    onChange={(e) => handleInputChange('services', 'crew_size', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Availability *</label>
                  <select
                    value={formData.services.availability}
                    onChange={(e) => handleInputChange('services', 'availability', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select availability</option>
                    <option value="available">Available Now</option>
                    <option value="busy">Currently Busy</option>
                    <option value="unavailable">Not Available</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documentation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Documentation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business License *</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('business_license', e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Certificate *</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('insurance_certificate', e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">W-9 Tax Form *</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('w9_form', e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Safety Certificate</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('safety_certificate', e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">References (3 required) *</label>
                {formData.documents.references.map((ref, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={ref}
                      onChange={(e) => handleReferenceChange(index, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Reference ${index + 1}: Company name, contact person, phone number`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Review & Submit</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Company Information</h5>
                    <p><strong>Company:</strong> {formData.companyInfo.company_name}</p>
                    <p><strong>Business Type:</strong> {formData.companyInfo.business_type}</p>
                    <p><strong>Years in Business:</strong> {formData.companyInfo.years_in_business}</p>
                    <p><strong>License:</strong> {formData.companyInfo.license_number}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                    <p><strong>Contact:</strong> {formData.contactInfo.primary_contact}</p>
                    <p><strong>Email:</strong> {formData.contactInfo.email}</p>
                    <p><strong>Phone:</strong> {formData.contactInfo.phone}</p>
                    <p><strong>Location:</strong> {formData.contactInfo.city}, {formData.contactInfo.state}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Services</h5>
                    <p><strong>Specialties:</strong> {formData.services.specialties.join(', ')}</p>
                    <p><strong>Crew Size:</strong> {formData.services.crew_size}</p>
                    <p><strong>Availability:</strong> {formData.services.availability}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Documentation</h5>
                    <p><strong>Business License:</strong> {formData.documents.business_license?.name || 'Not uploaded'}</p>
                    <p><strong>Insurance:</strong> {formData.documents.insurance_certificate?.name || 'Not uploaded'}</p>
                    <p><strong>W-9:</strong> {formData.documents.w9_form?.name || 'Not uploaded'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorOnboarding;