import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan,
  Plus,
  Search,
  Printer,
  Camera,
  Package,
  MapPin,
  Calendar,
  Hash,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface BarcodeItem {
  id: number;
  item_id: number;
  barcode: string;
  barcode_type: string;
  serial_number: string;
  lot_number: string;
  expiration_date: string;
  location_id: number;
  status: string;
  last_scanned_at: string;
  last_scanned_by: number;
  scan_count: number;
  created_at: string;
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
}

interface Location {
  id: number;
  name: string;
  code: string;
}

const BarcodeManager: React.FC = () => {
  const [barcodes, setBarcodes] = useState<BarcodeItem[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [generationForm, setGenerationForm] = useState({
    item_id: '',
    quantity: 1,
    barcode_type: 'Code128',
    location_id: '',
    serial_number: '',
    lot_number: '',
    expiration_date: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Load barcodes
      const filters = [];
      if (searchTerm) {
        filters.push({ name: "barcode", op: "StringContains", value: searchTerm });
      }

      const [barcodesResponse, itemsResponse, locationsResponse] = await Promise.all([
        window.ezsite.apis.tablePage(35430, {
          PageNo: 1,
          PageSize: 100,
          OrderByField: "created_at",
          IsAsc: false,
          Filters: filters
        }),
        window.ezsite.apis.tablePage(35427, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        }),
        window.ezsite.apis.tablePage(35428, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        })
      ]);

      if (barcodesResponse.error) throw barcodesResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      setBarcodes(barcodesResponse.data?.List || []);
      setItems(itemsResponse.data?.List || []);
      setLocations(locationsResponse.data?.List || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load barcode data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const generateBarcode = (length: number = 12) => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateBarcodes = async () => {
    try {
      const now = new Date().toISOString();
      const barcodes = [];

      for (let i = 0; i < generationForm.quantity; i++) {
        const barcode = generateBarcode();
        barcodes.push({
          item_id: parseInt(generationForm.item_id),
          barcode: barcode,
          barcode_type: generationForm.barcode_type,
          serial_number: generationForm.serial_number || `SN${Date.now()}${i}`,
          lot_number: generationForm.lot_number,
          expiration_date: generationForm.expiration_date || null,
          location_id: parseInt(generationForm.location_id),
          status: 'active',
          scan_count: 0,
          created_at: now,
          updated_at: now,
          created_by: 1,
          updated_by: 1
        });
      }

      for (const barcodeData of barcodes) {
        const { error } = await window.ezsite.apis.tableCreate(35430, barcodeData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Generated ${generationForm.quantity} barcodes successfully`
      });

      setShowGenerateDialog(false);
      setGenerationForm({
        item_id: '',
        quantity: 1,
        barcode_type: 'Code128',
        location_id: '',
        serial_number: '',
        lot_number: '',
        expiration_date: ''
      });
      loadData();
    } catch (error) {
      console.error('Error generating barcodes:', error);
      toast({
        title: "Error",
        description: "Failed to generate barcodes",
        variant: "destructive"
      });
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleScan = async (barcode: string) => {
    try {
      // Record the scan
      const barcodeRecord = barcodes.find(b => b.barcode === barcode);
      if (barcodeRecord) {
        const { error } = await window.ezsite.apis.tableUpdate(35430, {
          id: barcodeRecord.id,
          last_scanned_at: new Date().toISOString(),
          last_scanned_by: 1,
          scan_count: barcodeRecord.scan_count + 1,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;

        // Create movement record
        const item = items.find(i => i.id === barcodeRecord.item_id);
        toast({
          title: "Barcode Scanned",
          description: `Scanned: ${item?.name || 'Unknown Item'} (${barcode})`
        });
      } else {
        toast({
          title: "Unknown Barcode",
          description: `Barcode ${barcode} not found in system`,
          variant: "destructive"
        });
      }

      setScanResult(barcode);
      loadData();
    } catch (error) {
      console.error('Error processing scan:', error);
      toast({
        title: "Error",
        description: "Failed to process barcode scan",
        variant: "destructive"
      });
    }
  };

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const getItemName = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || 'Unknown Item';
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const columns = [
    {
      key: 'barcode',
      title: 'Barcode',
      sortable: true,
      render: (value: string, item: BarcodeItem) => (
        <div className="font-mono">
          <div className="font-medium">{value}</div>
          <Badge variant="outline" className="text-xs">
            {item.barcode_type}
          </Badge>
        </div>
      )
    },
    {
      key: 'item_id',
      title: 'Item',
      render: (value: number, item: BarcodeItem) => (
        <div>
          <div className="font-medium">{getItemName(value)}</div>
          {item.serial_number && (
            <div className="text-xs text-gray-500">SN: {item.serial_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'location_id',
      title: 'Location',
      render: (value: number) => getLocationName(value)
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'scan_count',
      title: 'Scan Count',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'last_scanned_at',
      title: 'Last Scanned',
      sortable: true,
      render: (value: string) => 
        value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Barcode Management</h1>
          <p className="text-gray-600">Generate, scan, and manage inventory barcodes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs defaultValue="manual">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="camera">Camera Scan</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-4">
                    <div>
                      <Label htmlFor="manual-barcode">Enter Barcode</Label>
                      <div className="flex gap-2">
                        <Input
                          id="manual-barcode"
                          value={manualBarcode}
                          onChange={(e) => setManualBarcode(e.target.value)}
                          placeholder="Enter or scan barcode"
                          onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                        />
                        <Button onClick={handleManualScan} size="sm">
                          <Scan className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="camera" className="space-y-4">
                    <div className="text-center">
                      {!isScanning ? (
                        <Button onClick={startCamera} className="w-full">
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <div>
                          <video
                            ref={videoRef}
                            className="w-full h-48 bg-black rounded"
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <Button onClick={stopCamera} variant="outline" className="mt-2">
                            Stop Camera
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {scanResult && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      Last scanned: <span className="font-mono">{scanResult}</span>
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate Barcodes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Barcodes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item *</Label>
                  <Select
                    value={generationForm.item_id}
                    onValueChange={(value) => setGenerationForm({...generationForm, item_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={generationForm.location_id}
                    onValueChange={(value) => setGenerationForm({...generationForm, location_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name} ({location.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={generationForm.quantity}
                      onChange={(e) => setGenerationForm({...generationForm, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Barcode Type</Label>
                    <Select
                      value={generationForm.barcode_type}
                      onValueChange={(value) => setGenerationForm({...generationForm, barcode_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Code128">Code 128</SelectItem>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="EAN">EAN</SelectItem>
                        <SelectItem value="QR">QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="lot">Lot Number (Optional)</Label>
                  <Input
                    id="lot"
                    value={generationForm.lot_number}
                    onChange={(e) => setGenerationForm({...generationForm, lot_number: e.target.value})}
                    placeholder="Enter lot number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateBarcodes}
                  disabled={!generationForm.item_id || !generationForm.location_id}
                >
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search barcodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{barcodes.length}</div>
              <div className="text-sm text-gray-600">Total Barcodes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barcodes Table */}
      <DataTable
        title="Barcodes"
        data={barcodes}
        columns={columns}
        loading={loading}
        onView={(barcode) => {
          toast({
            title: "Barcode Details",
            description: `${barcode.barcode} - ${getItemName(barcode.item_id)}`
          });
        }}
        onDelete={async (barcode) => {
          try {
            const { error } = await window.ezsite.apis.tableDelete(35430, { ID: barcode.id });
            if (error) throw error;
            toast({
              title: "Success",
              description: "Barcode deleted successfully"
            });
            loadData();
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete barcode",
              variant: "destructive"
            });
          }
        }}
      />
    </div>
  );
};

export default BarcodeManager;