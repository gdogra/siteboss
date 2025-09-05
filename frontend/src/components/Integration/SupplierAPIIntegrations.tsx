import React, { useState, useEffect } from 'react';
import { 
  LinkIcon, 
  BuildingStorefrontIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SupplierAPI {
  id: string;
  name: string;
  type: 'materials' | 'equipment' | 'tools' | 'services';
  logo: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  features: string[];
  apiVersion: string;
  lastSync: Date;
  connectionHealth: number;
  rateLimit: {
    current: number;
    limit: number;
    resetTime: Date;
  };
  supportedOperations: string[];
  pricing: {
    setup: number;
    monthly: number;
    perTransaction: number;
  };
}

interface RealTimePricing {
  supplierId: string;
  productId: string;
  productName: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  availability: 'in-stock' | 'limited' | 'out-of-stock' | 'discontinued';
  leadTime: number;
  minimumOrder: number;
  discountTiers: Array<{
    quantity: number;
    discount: number;
  }>;
  lastUpdated: Date;
}

interface AutoOrder {
  id: string;
  supplierId: string;
  productId: string;
  productName: string;
  triggerQuantity: number;
  orderQuantity: number;
  status: 'active' | 'paused' | 'fulfilled' | 'error';
  nextCheck: Date;
  estimatedDelivery: Date;
  totalCost: number;
}

export const SupplierAPIIntegrations: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierAPI[]>([]);
  const [realTimePricing, setRealTimePricing] = useState<RealTimePricing[]>([]);
  const [autoOrders, setAutoOrders] = useState<AutoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierAPI | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadSupplierAPIs();
    loadRealTimePricing();
    loadAutoOrders();
  }, []);

  const loadSupplierAPIs = async () => {
    // Simulate API call to load supplier integrations
    const mockSuppliers: SupplierAPI[] = [
      {
        id: 'home-depot-api',
        name: 'Home Depot Pro',
        type: 'materials',
        logo: '/api/logos/home-depot.png',
        description: 'Professional building materials and supplies',
        status: 'connected',
        features: ['Real-time pricing', 'Inventory checking', 'Bulk ordering', 'Delivery tracking'],
        apiVersion: 'v2.1',
        lastSync: new Date(Date.now() - 300000), // 5 minutes ago
        connectionHealth: 98,
        rateLimit: {
          current: 45,
          limit: 1000,
          resetTime: new Date(Date.now() + 3600000) // 1 hour from now
        },
        supportedOperations: ['GET_PRODUCTS', 'CHECK_INVENTORY', 'CREATE_ORDER', 'TRACK_DELIVERY'],
        pricing: {
          setup: 0,
          monthly: 49.99,
          perTransaction: 0.25
        }
      },
      {
        id: 'lowes-pro',
        name: "Lowe's Pro Services",
        type: 'materials',
        logo: '/api/logos/lowes.png',
        description: 'Professional contractor supplies and materials',
        status: 'connected',
        features: ['Volume discounts', 'Special order items', 'Job site delivery', 'Credit terms'],
        apiVersion: 'v1.8',
        lastSync: new Date(Date.now() - 180000), // 3 minutes ago
        connectionHealth: 95,
        rateLimit: {
          current: 23,
          limit: 500,
          resetTime: new Date(Date.now() + 2100000) // 35 minutes from now
        },
        supportedOperations: ['GET_PRODUCTS', 'GET_PRICING', 'CREATE_ORDER', 'GET_ORDER_STATUS'],
        pricing: {
          setup: 99.99,
          monthly: 39.99,
          perTransaction: 0.30
        }
      },
      {
        id: 'uline',
        name: 'Uline',
        type: 'materials',
        logo: '/api/logos/uline.png',
        description: 'Industrial supplies and safety equipment',
        status: 'connected',
        features: ['Same-day shipping', 'Industrial supplies', 'Safety equipment', 'Custom packaging'],
        apiVersion: 'v3.0',
        lastSync: new Date(Date.now() - 120000), // 2 minutes ago
        connectionHealth: 92,
        rateLimit: {
          current: 67,
          limit: 800,
          resetTime: new Date(Date.now() + 1800000) // 30 minutes from now
        },
        supportedOperations: ['GET_CATALOG', 'CHECK_STOCK', 'PLACE_ORDER', 'TRACK_SHIPMENT'],
        pricing: {
          setup: 0,
          monthly: 29.99,
          perTransaction: 0.15
        }
      },
      {
        id: 'united-rentals',
        name: 'United Rentals',
        type: 'equipment',
        logo: '/api/logos/united-rentals.png',
        description: 'Equipment rental and services',
        status: 'pending',
        features: ['Equipment rental', 'Maintenance services', 'Delivery/pickup', 'Insurance options'],
        apiVersion: 'v2.5',
        lastSync: new Date(Date.now() - 7200000), // 2 hours ago
        connectionHealth: 0,
        rateLimit: {
          current: 0,
          limit: 300,
          resetTime: new Date(Date.now() + 3600000)
        },
        supportedOperations: ['GET_INVENTORY', 'CHECK_AVAILABILITY', 'CREATE_RENTAL', 'MANAGE_RETURNS'],
        pricing: {
          setup: 199.99,
          monthly: 79.99,
          perTransaction: 0.50
        }
      },
      {
        id: 'grainger',
        name: 'Grainger',
        type: 'tools',
        logo: '/api/logos/grainger.png',
        description: 'Industrial tools and MRO supplies',
        status: 'error',
        features: ['Industrial tools', 'MRO supplies', 'Technical support', 'Custom solutions'],
        apiVersion: 'v1.9',
        lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
        connectionHealth: 0,
        rateLimit: {
          current: 0,
          limit: 600,
          resetTime: new Date(Date.now() + 1200000)
        },
        supportedOperations: ['SEARCH_PRODUCTS', 'GET_PRICING', 'ORDER_MANAGEMENT'],
        pricing: {
          setup: 149.99,
          monthly: 59.99,
          perTransaction: 0.35
        }
      },
      {
        id: 'ferguson',
        name: 'Ferguson',
        type: 'materials',
        logo: '/api/logos/ferguson.png',
        description: 'Plumbing and HVAC supplies',
        status: 'disconnected',
        features: ['Plumbing supplies', 'HVAC equipment', 'Waterworks', 'Fire & fabrication'],
        apiVersion: 'v2.0',
        lastSync: new Date(Date.now() - 86400000), // 24 hours ago
        connectionHealth: 0,
        rateLimit: {
          current: 0,
          limit: 400,
          resetTime: new Date(Date.now() + 3600000)
        },
        supportedOperations: ['PRODUCT_SEARCH', 'PRICE_CHECK', 'ORDER_PLACEMENT', 'DELIVERY_SCHEDULE'],
        pricing: {
          setup: 0,
          monthly: 45.99,
          perTransaction: 0.20
        }
      }
    ];

    setSuppliers(mockSuppliers);
    setLoading(false);
  };

  const loadRealTimePricing = async () => {
    // Simulate real-time pricing data
    const mockPricing: RealTimePricing[] = [
      {
        supplierId: 'home-depot-api',
        productId: 'HD-LUM-001',
        productName: '2x4x8 Pressure Treated Lumber',
        currentPrice: 4.97,
        previousPrice: 5.23,
        priceChange: -4.97,
        availability: 'in-stock',
        leadTime: 0,
        minimumOrder: 1,
        discountTiers: [
          { quantity: 50, discount: 5 },
          { quantity: 100, discount: 10 },
          { quantity: 500, discount: 15 }
        ],
        lastUpdated: new Date(Date.now() - 60000)
      },
      {
        supplierId: 'lowes-pro',
        productId: 'LP-CON-045',
        productName: 'Quikrete 80lb Concrete Mix',
        currentPrice: 5.48,
        previousPrice: 5.48,
        priceChange: 0,
        availability: 'limited',
        leadTime: 2,
        minimumOrder: 10,
        discountTiers: [
          { quantity: 25, discount: 3 },
          { quantity: 50, discount: 7 },
          { quantity: 100, discount: 12 }
        ],
        lastUpdated: new Date(Date.now() - 180000)
      },
      {
        supplierId: 'uline',
        productId: 'UL-SAF-789',
        productName: 'Safety Helmet - OSHA Compliant',
        currentPrice: 24.99,
        previousPrice: 22.50,
        priceChange: 11.07,
        availability: 'in-stock',
        leadTime: 1,
        minimumOrder: 1,
        discountTiers: [
          { quantity: 10, discount: 8 },
          { quantity: 25, discount: 15 },
          { quantity: 50, discount: 20 }
        ],
        lastUpdated: new Date(Date.now() - 90000)
      }
    ];

    setRealTimePricing(mockPricing);
  };

  const loadAutoOrders = async () => {
    // Simulate auto order data
    const mockAutoOrders: AutoOrder[] = [
      {
        id: 'auto-001',
        supplierId: 'home-depot-api',
        productId: 'HD-LUM-001',
        productName: '2x4x8 Pressure Treated Lumber',
        triggerQuantity: 50,
        orderQuantity: 200,
        status: 'active',
        nextCheck: new Date(Date.now() + 3600000), // 1 hour from now
        estimatedDelivery: new Date(Date.now() + 172800000), // 2 days from now
        totalCost: 994.00
      },
      {
        id: 'auto-002',
        supplierId: 'uline',
        productId: 'UL-SAF-789',
        productName: 'Safety Helmet - OSHA Compliant',
        triggerQuantity: 10,
        orderQuantity: 25,
        status: 'fulfilled',
        nextCheck: new Date(Date.now() + 604800000), // 1 week from now
        estimatedDelivery: new Date(Date.now() + 86400000), // 1 day from now
        totalCost: 531.25
      }
    ];

    setAutoOrders(mockAutoOrders);
  };

  const connectSupplier = async (supplierId: string) => {
    setConnecting(supplierId);
    
    // Simulate API connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, status: 'connected', connectionHealth: 95, lastSync: new Date() }
        : supplier
    ));
    
    setConnecting(null);
  };

  const disconnectSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, status: 'disconnected', connectionHealth: 0 }
        : supplier
    ));
  };

  const syncSupplier = async (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, lastSync: new Date() }
        : supplier
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) {
      return <span className="text-red-600">↑ {change.toFixed(1)}%</span>;
    } else if (change < 0) {
      return <span className="text-green-600">↓ {Math.abs(change).toFixed(1)}%</span>;
    }
    return <span className="text-gray-600">—</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LinkIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Supplier API Integrations</h2>
            <p className="text-gray-600">Real-time pricing, inventory, and automated ordering</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add Integration
        </button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {suppliers.filter(s => s.status === 'connected').length}
              </p>
              <p className="text-gray-600">Connected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {suppliers.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {realTimePricing.length}
              </p>
              <p className="text-gray-600">Live Prices</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {autoOrders.filter(a => a.status === 'active').length}
              </p>
              <p className="text-gray-600">Auto Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Integrations */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Supplier Integrations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">{supplier.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{supplier.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>API v{supplier.apiVersion}</span>
                      <span>Type: {supplier.type}</span>
                      {supplier.status === 'connected' && (
                        <span>Health: {supplier.connectionHealth}%</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(supplier.status)}
                  {supplier.status === 'connected' && (
                    <button 
                      onClick={() => syncSupplier(supplier.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Sync data"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  )}
                  {supplier.status === 'connected' ? (
                    <button 
                      onClick={() => disconnectSupplier(supplier.id)}
                      className="px-3 py-1 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => connectSupplier(supplier.id)}
                      disabled={connecting === supplier.id}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {connecting === supplier.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              {supplier.status === 'connected' && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <p className="font-medium">{supplier.lastSync.toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rate Limit:</span>
                    <p className="font-medium">{supplier.rateLimit.current}/{supplier.rateLimit.limit}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Cost:</span>
                    <p className="font-medium">${supplier.pricing.monthly}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Operations:</span>
                    <p className="font-medium">{supplier.supportedOperations.length} available</p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {supplier.features.map((feature, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Pricing */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Pricing</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {realTimePricing.map((item) => {
                const supplier = suppliers.find(s => s.id === item.supplierId);
                return (
                  <tr key={`${item.supplierId}-${item.productId}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.productId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${item.currentPrice}</div>
                      <div className="text-sm text-gray-500">Min: {item.minimumOrder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPriceChangeIcon(item.priceChange)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.availability === 'in-stock' ? 'bg-green-100 text-green-800' :
                        item.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.leadTime} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Order</button>
                      <button className="text-blue-600 hover:text-blue-900">Auto-Order</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Automated Orders</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
              Create Auto Order
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {autoOrders.map((order) => {
            const supplier = suppliers.find(s => s.id === order.supplierId);
            return (
              <div key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <TruckIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{order.productName}</h4>
                      <p className="text-gray-600">Supplier: {supplier?.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Trigger: {order.triggerQuantity} units</span>
                        <span>Order: {order.orderQuantity} units</span>
                        <span>Cost: ${order.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'active' ? 'bg-green-100 text-green-800' :
                      order.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                    <div className="text-right text-sm text-gray-600">
                      <div>Next check: {order.nextCheck.toLocaleDateString()}</div>
                      <div>Est. delivery: {order.estimatedDelivery.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupplierAPIIntegrations;