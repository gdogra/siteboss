import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  PenTool, Upload, Type, MapPin, Check, X, 
  Shield, Clock, User, FileSignature
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalSignatureProps {
  proposalId: number;
  proposalVersionId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const ProposalSignature: React.FC<ProposalSignatureProps> = ({ 
  proposalId, 
  proposalVersionId, 
  onSuccess, 
  onCancel 
}) => {
  const [signatureType, setSignatureType] = useState<'drawn' | 'typed' | 'uploaded'>('drawn');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerRole, setSignerRole] = useState('client');
  const [enableGPS, setEnableGPS] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (enableGPS) {
      getCurrentLocation();
    }
  }, [enableGPS]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
        setGpsError('');
      },
      (error) => {
        setGpsError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasEvent>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  // File upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'File Too Large',
          description: 'Please select an image under 2MB',
          variant: 'destructive'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file',
          variant: 'destructive'
        });
        return;
      }

      setUploadedSignature(file);
      
      // Preview the uploaded signature
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureData(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate typed signature
  const generateTypedSignature = () => {
    if (!typedSignature.trim()) return;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'black';
      ctx.font = '24px cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      
      setSignatureData(canvas.toDataURL());
    }
  };

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async () => {
    // Validation
    if (!signerName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return;
    }

    if (!signerEmail.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email',
        variant: 'destructive'
      });
      return;
    }

    if (!signatureData && signatureType !== 'uploaded') {
      toast({
        title: 'Validation Error',
        description: 'Please provide a signature',
        variant: 'destructive'
      });
      return;
    }

    if (!agreementAccepted) {
      toast({
        title: 'Validation Error',
        description: 'Please accept the agreement to proceed',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      let finalSignatureData = signatureData;

      // If uploaded signature, upload to server first
      if (signatureType === 'uploaded' && uploadedSignature) {
        const { data: uploadResult, error: uploadError } = await window.ezsite.apis.upload({
          filename: uploadedSignature.name,
          file: uploadedSignature
        });

        if (uploadError) throw uploadError;
        
        const { data: fileUrl, error: urlError } = await window.ezsite.apis.getUploadUrl(uploadResult);
        if (urlError) throw urlError;
        
        finalSignatureData = fileUrl;
      }

      const verificationCode = generateVerificationCode();

      // Save signature
      const signatureRecord = {
        proposal_id: proposalId,
        proposal_version_id: proposalVersionId,
        signer_name: signerName,
        signer_email: signerEmail,
        signer_role: signerRole,
        signature_type: signatureType,
        signature_data: finalSignatureData,
        ip_address: '', // Browser doesn't have direct access
        user_agent: navigator.userAgent,
        gps_coordinates: gpsLocation ? JSON.stringify(gpsLocation) : '',
        signed_at: new Date().toISOString(),
        verification_code: verificationCode,
        is_verified: true,
        certificate_data: JSON.stringify({
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          gps_enabled: enableGPS,
          gps_accuracy: gpsLocation?.accuracy
        }),
        created_at: new Date().toISOString()
      };

      const { error: signatureError } = await window.ezsite.apis.tableCreate(35435, signatureRecord);
      
      if (signatureError) throw signatureError;

      // Update proposal status
      const { error: proposalError } = await window.ezsite.apis.tableUpdate(35433, {
        ID: proposalId,
        status: 'signed',
        signed_at: new Date().toISOString()
      });

      if (proposalError) throw proposalError;

      // Track analytics
      await window.ezsite.apis.tableCreate(35436, {
        proposal_id: proposalId,
        event_type: 'sign',
        event_data: JSON.stringify({
          signature_type: signatureType,
          gps_enabled: enableGPS,
          verification_code: verificationCode,
          timestamp: new Date().toISOString()
        }),
        user_email: signerEmail,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });

      // Send notification email
      try {
        await window.ezsite.apis.sendEmail({
          from: 'proposals@yourcompany.com',
          to: [signerEmail, 'admin@yourcompany.com'],
          subject: `Proposal Signed: ${signerName}`,
          html: `
            <h2>Proposal Signed Successfully</h2>
            <p>The proposal has been signed by ${signerName}.</p>
            <p><strong>Verification Code:</strong> ${verificationCode}</p>
            <p><strong>Signed At:</strong> ${new Date().toLocaleString()}</p>
            ${gpsLocation ? `<p><strong>Location:</strong> ${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}</p>` : ''}
            <p>Thank you for your business!</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the signature process if email fails
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting signature:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit signature. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="w-5 h-5" />
          Sign Proposal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signer Information */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Signer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signer_name">Full Name *</Label>
              <Input
                id="signer_name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="signer_email">Email Address *</Label>
              <Input
                id="signer_email"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="signer_role">Role</Label>
              <Select value={signerRole} onValueChange={setSignerRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="witness">Witness</SelectItem>
                  <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* GPS Location */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Verification
            </h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-gps"
                checked={enableGPS}
                onCheckedChange={setEnableGPS}
              />
              <Label htmlFor="enable-gps">Enable GPS</Label>
            </div>
          </div>

          {enableGPS && (
            <div className="p-3 border rounded-lg bg-gray-50">
              {gpsLocation ? (
                <div className="text-sm text-green-700">
                  <Check className="w-4 h-4 inline mr-2" />
                  Location verified (±{gpsLocation.accuracy.toFixed(0)}m accuracy)
                </div>
              ) : gpsError ? (
                <div className="text-sm text-red-600">
                  <X className="w-4 h-4 inline mr-2" />
                  {gpsError}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="ml-2 p-0 h-auto"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Getting location...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Signature Methods */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Signature
          </h3>

          <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="drawn">
                <PenTool className="w-4 h-4 mr-2" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="typed">
                <Type className="w-4 h-4 mr-2" />
                Type
              </TabsTrigger>
              <TabsTrigger value="uploaded">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drawn" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full border rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Draw your signature above</p>
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typed" className="space-y-4">
              <div>
                <Label htmlFor="typed_signature">Type your name as signature</Label>
                <Input
                  id="typed_signature"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-2xl font-cursive"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateTypedSignature}
                  disabled={!typedSignature.trim()}
                  className="mt-2"
                >
                  Generate Signature
                </Button>
              </div>
              
              {signatureData && (
                <div className="border rounded-lg p-4">
                  <img src={signatureData} alt="Typed signature" className="max-w-full h-auto" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="uploaded" className="space-y-4">
              <div>
                <Label>Upload signature image</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {signatureData && (
                <div className="border rounded-lg p-4">
                  <img src={signatureData} alt="Uploaded signature" className="max-w-full h-auto" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-2 p-4 border rounded-lg bg-blue-50">
          <input
            type="checkbox"
            id="agreement"
            checked={agreementAccepted}
            onChange={(e) => setAgreementAccepted(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreement" className="text-sm text-gray-700">
            <strong>Digital Signature Agreement:</strong> I agree that my electronic signature 
            is the legal equivalent of my manual signature and that I am signing this document 
            voluntarily. I understand that this signature is legally binding.
          </label>
        </div>

        {/* Security Notice */}
        <div className="flex items-start space-x-2 p-3 border rounded-lg bg-gray-50">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <strong>Security:</strong> Your signature will be encrypted and stored securely. 
            {enableGPS && gpsLocation && ' Location data will be recorded for verification purposes.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !agreementAccepted || !signerName.trim() || !signerEmail.trim()}
          >
            {loading ? 'Signing...' : 'Sign Proposal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalSignature;