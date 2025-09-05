import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  BeakerIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { aiService, MaterialCost } from '../../services/aiService';

interface MaterialDemand {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  currentStock: number;
  predictedUsage: number;
  recommendedOrder: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDepletion: Date;
  suppliers: MaterialSupplier[];
  priceHistory: PricePoint[];
  weatherImpact: number;
  projectDependencies: string[];
}

interface MaterialSupplier {
  id: string;
  name: string;
  price: number;
  leadTime: number;
  reliability: number;
  minOrder: number;
  available: number;
  distance: number;
}

interface PricePoint {
  date: Date;
  price: number;
}

interface PredictiveMaterialOrderingProps {
  projectId: string;
}

const PredictiveMaterialOrdering: React.FC<PredictiveMaterialOrderingProps> = ({ projectId }) => {
  const [materialDemands, setMaterialDemands] = useState<MaterialDemand[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  useEffect(() => {
    loadMaterialDemands();
  }, [projectId]);

  const loadMaterialDemands = async () => {
    try {
      setLoading(true);
      
      // Simulate AI prediction service call
      const predictions = await generateMaterialDemands();
      setMaterialDemands(predictions);
    } catch (error) {
      console.error('Failed to load material demands:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPredictions = async () => {
    try {
      setRefreshing(true);
      const predictions = await generateMaterialDemands();
      setMaterialDemands(predictions);
    } catch (error) {
      console.error('Failed to refresh predictions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateMaterialDemands = async (): Promise<MaterialDemand[]> => {
    // Simulate AI analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            materialId: 'concrete-001',
            materialName: 'Ready Mix Concrete',
            category: 'Concrete',
            currentStock: 50,
            predictedUsage: 180,
            recommendedOrder: 150,
            urgency: 'high',
            estimatedDepletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            suppliers: [
              {
                id: 'sup-1',
                name: 'City Concrete Co.',
                price: 120,
                leadTime: 2,
                reliability: 0.95,
                minOrder: 10,
                available: 500,
                distance: 8.5
              },
              {
                id: 'sup-2',
                name: 'Metro Ready Mix',
                price: 125,
                leadTime: 1,
                reliability: 0.98,
                minOrder: 5,
                available: 300,
                distance: 12.2
              }
            ],
            priceHistory: [
              { date: new Date('2024-01-01'), price: 115 },
              { date: new Date('2024-02-01'), price: 118 },
              { date: new Date('2024-03-01'), price: 120 }
            ],
            weatherImpact: 0.15,
            projectDependencies: ['Foundation Phase', 'Basement Walls']
          },
          {
            id: '2',
            materialId: 'steel-001',
            materialName: 'Structural Steel Beams',
            category: 'Steel',
            currentStock: 25,
            predictedUsage: 40,
            recommendedOrder: 20,
            urgency: 'medium',
            estimatedDepletion: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            suppliers: [
              {
                id: 'sup-3',
                name: 'Steel Dynamics Inc.',
                price: 850,
                leadTime: 7,
                reliability: 0.92,
                minOrder: 5,
                available: 100,
                distance: 25.0
              }
            ],
            priceHistory: [
              { date: new Date('2024-01-01'), price: 820 },
              { date: new Date('2024-02-01'), price: 835 },
              { date: new Date('2024-03-01'), price: 850 }
            ],
            weatherImpact: 0.05,
            projectDependencies: ['Structural Frame']
          },
          {
            id: '3',
            materialId: 'lumber-001',
            materialName: 'Framing Lumber 2x8',
            category: 'Lumber',
            currentStock: 200,
            predictedUsage: 150,
            recommendedOrder: 0,
            urgency: 'low',
            estimatedDepletion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            suppliers: [
              {
                id: 'sup-4',
                name: 'Home Depot Pro',
                price: 12,
                leadTime: 3,
                reliability: 0.90,
                minOrder: 50,
                available: 1000,
                distance: 5.5
              }
            ],
            priceHistory: [
              { date: new Date('2024-01-01'), price: 15 },
              { date: new Date('2024-02-01'), price: 13 },
              { date: new Date('2024-03-01'), price: 12 }
            ],
            weatherImpact: 0.10,
            projectDependencies: ['Framing Phase']
          }
        ]);
      }, 1000);
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'high':
        return <ClockIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    }
  };

  const getTrendIcon = (priceHistory: PricePoint[]) => {
    if (priceHistory.length < 2) return null;
    
    const latest = priceHistory[priceHistory.length - 1].price;
    const previous = priceHistory[priceHistory.length - 2].price;
    
    if (latest > previous) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
    } else if (latest < previous) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const filteredMaterials = materialDemands.filter(material => {
    const categoryMatch = filterCategory === 'all' || material.category.toLowerCase() === filterCategory;
    const urgencyMatch = filterUrgency === 'all' || material.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  const categories = Array.from(new Set(materialDemands.map(m => m.category)));
  const urgencies = ['low', 'medium', 'high', 'critical'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TruckIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictive Material Ordering</h2>
            <p className="text-gray-600">AI-powered demand forecasting and supplier optimization</p>
          </div>
        </div>
        <button
          onClick={refreshPredictions}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
              Updating...
            </>
          ) : (
            <>
              <BeakerIcon className="h-4 w-4 mr-2" />
              Refresh Predictions
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Critical Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {materialDemands.filter(m => m.urgency === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Potential Savings</p>
              <p className="text-2xl font-bold text-gray-900">$12,500</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Lead Time</p>
              <p className="text-2xl font-bold text-gray-900">4 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Urgency</option>
              {urgencies.map(urgency => (
                <option key={urgency} value={urgency} className="capitalize">{urgency}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Material Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedMaterial(material)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{material.materialName}</h3>
                  <p className="text-sm text-gray-600">{material.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getUrgencyIcon(material.urgency)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(material.urgency)}`}>
                    {material.urgency}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Stock Level */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Current Stock</span>
                    <span className="font-medium">{material.currentStock} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        material.currentStock / material.predictedUsage > 0.5 ? 'bg-green-500' :
                        material.currentStock / material.predictedUsage > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((material.currentStock / material.predictedUsage) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Predicted Usage */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Predicted Usage</span>
                  <span className="font-medium">{material.predictedUsage} units</span>
                </div>

                {/* Recommended Order */}
                {material.recommendedOrder > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recommended Order</span>
                    <span className="font-medium text-primary-600">{material.recommendedOrder} units</span>
                  </div>
                )}

                {/* Depletion Date */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Depletion</span>
                  <span className="font-medium">{material.estimatedDepletion.toLocaleDateString()}</span>
                </div>

                {/* Price Trend */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price Trend</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(material.priceHistory)}
                    <span className="font-medium">
                      ${material.priceHistory[material.priceHistory.length - 1]?.price}
                    </span>
                  </div>
                </div>

                {/* Best Supplier */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Supplier</span>
                  <span className="font-medium">{material.suppliers[0]?.name}</span>
                </div>
              </div>

              {/* Action Button */}
              {material.recommendedOrder > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center justify-center">
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    Order {material.recommendedOrder} Units
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedMaterial.materialName} - Detailed Analysis
              </h3>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Level:</span>
                      <span className="font-medium">{selectedMaterial.currentStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Predicted Usage:</span>
                      <span className="font-medium">{selectedMaterial.predictedUsage} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weather Impact:</span>
                      <span className="font-medium">{(selectedMaterial.weatherImpact * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">AI Recommendation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Quantity:</span>
                      <span className="font-medium text-primary-600">
                        {selectedMaterial.recommendedOrder} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Urgency:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(selectedMaterial.urgency)}`}>
                        {selectedMaterial.urgency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Depletion:</span>
                      <span className="font-medium">{selectedMaterial.estimatedDepletion.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suppliers Comparison */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Supplier Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reliability
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedMaterial.suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {supplier.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${supplier.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {supplier.leadTime} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(supplier.reliability * 100).toFixed(0)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {supplier.available} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {supplier.distance} mi
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Project Dependencies */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Project Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterial.projectDependencies.map((dep, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium">
                  Place Order
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium">
                  Get Quotes
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveMaterialOrdering;