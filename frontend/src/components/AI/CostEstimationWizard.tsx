import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { aiService, CostEstimation, MaterialCost, LaborCost } from '../../services/aiService';

interface ProjectSpecs {
  projectType: string;
  location: string;
  squareFootage: number;
  buildingHeight: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'high-end';
  timeline: number; // in months
  specialFeatures: string[];
  siteConditions: string[];
}

const CostEstimationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectSpecs, setProjectSpecs] = useState<ProjectSpecs>({
    projectType: '',
    location: '',
    squareFootage: 0,
    buildingHeight: 1,
    complexity: 'moderate',
    timeline: 6,
    specialFeatures: [],
    siteConditions: []
  });
  const [estimation, setEstimation] = useState<CostEstimation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectTypes = [
    { value: 'residential-single', label: 'Single Family Home', icon: '🏠' },
    { value: 'residential-multi', label: 'Multi-Family Residential', icon: '🏘️' },
    { value: 'commercial-office', label: 'Commercial Office', icon: '🏢' },
    { value: 'commercial-retail', label: 'Retail Space', icon: '🏪' },
    { value: 'industrial-warehouse', label: 'Industrial Warehouse', icon: '🏭' },
    { value: 'healthcare', label: 'Healthcare Facility', icon: '🏥' },
    { value: 'educational', label: 'Educational Building', icon: '🏫' },
    { value: 'hospitality', label: 'Hotel/Restaurant', icon: '🏨' }
  ];

  const specialFeatures = [
    'HVAC Systems', 'Elevators', 'High-End Finishes', 'Green Building Features',
    'Security Systems', 'Fire Suppression', 'Data Centers', 'Kitchen Equipment',
    'Swimming Pool', 'Parking Garage', 'Solar Panels', 'Smart Building Technology'
  ];

  const siteConditions = [
    'Urban Dense Area', 'Suburban', 'Rural', 'Waterfront', 'Sloped Terrain',
    'Rocky Soil', 'High Water Table', 'Environmental Restrictions',
    'Historic District', 'Limited Access', 'Utilities Available', 'New Development'
  ];

  const generateEstimate = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await aiService.generateCostEstimate(projectSpecs);
      setEstimation(result);
    } catch (err) {
      setError('Failed to generate cost estimation. Please try again.');
      console.error('Cost estimation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectSpecs = (field: keyof ProjectSpecs, value: any) => {
    setProjectSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayValue = (field: 'specialFeatures' | 'siteConditions', value: string) => {
    setProjectSpecs(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return projectSpecs.projectType && projectSpecs.location;
      case 2: return projectSpecs.squareFootage > 0;
      case 3: return true; // Optional features
      default: return false;
    }
  };

  const canProceed = () => {
    return isStepComplete(currentStep);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      generateEstimate();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Type & Location</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of project are you building?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {projectTypes.map(type => (
              <button
                key={type.value}
                onClick={() => updateProjectSpecs('projectType', type.value)}
                className={`p-4 border rounded-lg text-left hover:border-primary-300 transition-colors ${
                  projectSpecs.projectType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Location
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={projectSpecs.location}
              onChange={(e) => updateProjectSpecs('location', e.target.value)}
              placeholder="Enter city, state (e.g., New York, NY)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Location affects labor costs, material prices, and local building codes
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage
            </label>
            <div className="relative">
              <BuildingOffice2Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={projectSpecs.squareFootage || ''}
                onChange={(e) => updateProjectSpecs('squareFootage', parseInt(e.target.value) || 0)}
                placeholder="5000"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building Height (Stories)
            </label>
            <select
              value={projectSpecs.buildingHeight}
              onChange={(e) => updateProjectSpecs('buildingHeight', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Story' : 'Stories'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Complexity
            </label>
            <select
              value={projectSpecs.complexity}
              onChange={(e) => updateProjectSpecs('complexity', e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="simple">Simple - Basic construction</option>
              <option value="moderate">Moderate - Standard features</option>
              <option value="complex">Complex - Advanced systems</option>
              <option value="high-end">High-End - Luxury finishes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline (Months)
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={projectSpecs.timeline}
                onChange={(e) => updateProjectSpecs('timeline', parseInt(e.target.value) || 6)}
                min="1"
                max="60"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Features & Site Conditions</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Special Features (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specialFeatures.map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleArrayValue('specialFeatures', feature)}
                  className={`p-3 text-sm border rounded-lg text-left hover:border-primary-300 transition-colors ${
                    projectSpecs.specialFeatures.includes(feature)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Site Conditions (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {siteConditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleArrayValue('siteConditions', condition)}
                  className={`p-3 text-sm border rounded-lg text-left hover:border-primary-300 transition-colors ${
                    projectSpecs.siteConditions.includes(condition)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Generate Estimate</h3>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Project Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Project Type:</span>
              <span className="font-medium">
                {projectTypes.find(t => t.value === projectSpecs.projectType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{projectSpecs.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Square Footage:</span>
              <span className="font-medium">{projectSpecs.squareFootage.toLocaleString()} sq ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stories:</span>
              <span className="font-medium">{projectSpecs.buildingHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Complexity:</span>
              <span className="font-medium capitalize">{projectSpecs.complexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timeline:</span>
              <span className="font-medium">{projectSpecs.timeline} months</span>
            </div>
            {projectSpecs.specialFeatures.length > 0 && (
              <div>
                <span className="text-gray-600">Special Features:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {projectSpecs.specialFeatures.map(feature => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {projectSpecs.siteConditions.length > 0 && (
              <div>
                <span className="text-gray-600">Site Conditions:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {projectSpecs.siteConditions.map(condition => (
                    <span key={condition} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEstimationResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cost Estimation Complete</h3>
        <p className="text-gray-600">AI-powered analysis based on current market data</p>
      </div>

      {estimation && (
        <>
          {/* Total Cost Overview */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                ${estimation.totalEstimate.toLocaleString()}
              </div>
              <div className="text-lg text-gray-700">
                ${(estimation.totalEstimate / projectSpecs.squareFootage).toFixed(0)} per sq ft
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-sm text-gray-600 mr-2">Confidence Level:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {(estimation.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Categories */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Cost Breakdown
                </h4>
              </div>
              <div className="p-6 space-y-4">
                {/* Materials */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <WrenchScrewdriverIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">Materials</span>
                  </div>
                  <span className="font-medium">
                    ${estimation.materials.reduce((sum, m) => sum + m.totalCost, 0).toLocaleString()}
                  </span>
                </div>

                {/* Labor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">Labor</span>
                  </div>
                  <span className="font-medium">
                    ${estimation.labor.reduce((sum, l) => sum + l.totalCost, 0).toLocaleString()}
                  </span>
                </div>

                {/* Overhead */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BuildingOffice2Icon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">Overhead</span>
                  </div>
                  <span className="font-medium">${estimation.overhead.toLocaleString()}</span>
                </div>

                {/* Profit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">Profit</span>
                  </div>
                  <span className="font-medium">${estimation.profit.toLocaleString()}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary-600">${estimation.totalEstimate.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Materials */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-green-500" />
                  Key Materials
                </h4>
              </div>
              <div className="p-6 space-y-4">
                {estimation.materials.slice(0, 5).map((material, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{material.item}</p>
                      <p className="text-xs text-gray-600">
                        {material.quantity} {material.category === 'Concrete' ? 'cubic yards' : 'units'} 
                        @ ${material.unitCost}/unit
                      </p>
                      {material.availability && (
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            material.availability === 'in-stock' ? 'bg-green-500' :
                            material.availability === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-gray-500 capitalize">
                            {material.availability.replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium ml-4">
                      ${material.totalCost.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Labor Breakdown */}
          <div className="bg-white border rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
                Labor Breakdown
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estimation.labor.map((labor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{labor.role}</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Hours: {labor.hours}</p>
                      <p>Rate: ${labor.rate}/hour</p>
                      <p className="font-medium text-gray-900">
                        Total: ${labor.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 font-medium">
              Save Estimate
            </button>
            <button className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium">
              Export PDF
            </button>
            <button 
              onClick={() => {
                setCurrentStep(1);
                setEstimation(null);
                setProjectSpecs({
                  projectType: '',
                  location: '',
                  squareFootage: 0,
                  buildingHeight: 1,
                  complexity: 'moderate',
                  timeline: 6,
                  specialFeatures: [],
                  siteConditions: []
                });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              New Estimate
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <CalculatorIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Cost Estimation</h1>
        <p className="text-gray-600">Get accurate construction cost estimates powered by machine learning</p>
      </div>

      {/* Progress Steps */}
      {!estimation && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    step === currentStep
                      ? 'bg-primary-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {step === 1 ? 'Type & Location' :
                     step === 2 ? 'Specifications' :
                     step === 3 ? 'Features' : 'Review'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {!estimation ? (
          <>
            {/* Step Content */}
            <div className="mb-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={nextStep}
                disabled={!canProceed() || loading}
                className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Generate Estimate
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          renderEstimationResults()
        )}
      </div>
    </div>
  );
};

export default CostEstimationWizard;