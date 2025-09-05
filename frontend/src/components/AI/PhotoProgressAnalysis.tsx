import React, { useState, useCallback } from 'react';
import {
  CameraIcon,
  PhotoIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { aiService, ProgressAnalysis } from '../../services/aiService';

interface PhotoProgressAnalysisProps {
  projectId: string;
  taskId?: string;
  onAnalysisComplete?: (analysis: ProgressAnalysis) => void;
}

const PhotoProgressAnalysis: React.FC<PhotoProgressAnalysisProps> = ({
  projectId,
  taskId,
  onAnalysisComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageSelect(imageFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setAnalyzing(true);
      const projectContext = {
        projectId,
        taskId,
        analysisType: 'progress',
        timestamp: new Date()
      };

      const result = await aiService.analyzeProgressPhoto(selectedImage, projectContext);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      // Handle error state
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'violation': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CameraIcon className="h-8 w-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Photo Analysis</h2>
          <p className="text-gray-600">Upload photos to get instant progress and quality insights</p>
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="mx-auto max-h-64 rounded-lg shadow-sm"
                />
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={analyzeImage}
                    disabled={analyzing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Analyze Photo
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setAnalysis(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose Different Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your construction photo here</p>
                  <p className="text-gray-600">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>File:</strong> {selectedImage.name}</p>
              <p><strong>Size:</strong> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Progress Analysis
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                <span className={`text-2xl font-bold ${getCompletionColor(analysis.completionPercentage)}`}>
                  {analysis.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    analysis.completionPercentage >= 80 ? 'bg-green-500' :
                    analysis.completionPercentage >= 60 ? 'bg-blue-500' :
                    analysis.completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Detected Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.detectedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quality Issues */}
          {analysis.qualityIssues.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Quality Issues ({analysis.qualityIssues.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analysis.qualityIssues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-yellow-800">{issue.type}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-yellow-700 mb-2">{issue.description}</p>
                      <p className="text-sm text-yellow-600 mb-2">
                        <strong>Location:</strong> {issue.location}
                      </p>
                      <div className="bg-yellow-100 p-2 rounded">
                        <p className="text-sm font-medium text-yellow-800">Suggested Action:</p>
                        <p className="text-sm text-yellow-700">{issue.suggestedAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Safety Violations */}
          {analysis.safetyViolations.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShieldExclamationIcon className="h-5 w-5 mr-2 text-red-500" />
                  Safety Violations ({analysis.safetyViolations.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analysis.safetyViolations.map((violation, index) => (
                    <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-red-800">{violation.type}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <p className="text-red-700 mb-2">{violation.description}</p>
                      <p className="text-sm text-red-600 mb-2">
                        <strong>Regulation:</strong> {violation.regulation}
                      </p>
                      <div className="bg-red-100 p-2 rounded">
                        <p className="text-sm font-medium text-red-800">Required Action:</p>
                        <p className="text-sm text-red-700">{violation.requiredAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>Analyzed: {analysis.timestamp.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="h-4 w-4" />
                <span>Features: {analysis.detectedFeatures.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Issues: {analysis.qualityIssues.length + analysis.safetyViolations.length}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
              Save Analysis Report
            </button>
            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
              Share with Team
            </button>
            <button 
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
                setAnalysis(null);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Analyze Another Photo
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!analysis && !selectedImage && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Tips for Best Results</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take photos in good lighting conditions</li>
            <li>• Include clear views of the work area</li>
            <li>• Capture safety equipment and personnel</li>
            <li>• Take multiple angles for comprehensive analysis</li>
            <li>• Include reference objects for scale when possible</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhotoProgressAnalysis;