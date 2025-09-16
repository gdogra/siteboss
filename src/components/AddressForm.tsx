import React from 'react';
import { Label } from '@/components/ui/label';
import InfoTooltip, { HelpTooltip } from '@/components/InfoTooltip';
import { Input } from '@/components/ui/input';
import AddressAutocomplete, { AddressData } from './AddressAutocomplete';

interface AddressFormData {
  formatted_address: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: string | number;
  longitude?: string | number;
}

interface Props {
  data: AddressFormData;
  onChange: (data: Partial<AddressFormData>) => void;
  errors?: Record<string, string>;
  showCoordinates?: boolean;
  required?: boolean;
}

const AddressForm: React.FC<Props> = ({ 
  data, 
  onChange, 
  errors = {}, 
  showCoordinates = true,
  required = false 
}) => {
  const handleAddressSelect = (address: AddressData) => {
    onChange({
      formatted_address: address.formatted_address,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      latitude: address.lat ? Number(address.lat).toFixed(6) : data.latitude,
      longitude: address.lon ? Number(address.lon).toFixed(6) : data.longitude,
    });
  };

  const handleFieldChange = (field: keyof AddressFormData, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Main Address Field with Autocomplete */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Label htmlFor="address">
            Address {required && <span className="text-red-500">*</span>}
          </Label>
          <HelpTooltip
            title="Smart Address Input"
            content="Start typing any address to get intelligent suggestions from Google Places and OpenStreetMap."
            impact="Accurate addresses ensure proper location mapping, delivery coordination, and regulatory compliance."
            maxWidth="max-w-sm"
          />
        </div>
        <AddressAutocomplete
          value={data.formatted_address}
          onChange={(v) => handleFieldChange('formatted_address', v)}
          onAddressSelect={handleAddressSelect}
          placeholder="Enter full address (street, city, state, zip)"
          className="w-full"
        />
        {errors.formatted_address && (
          <p className="text-sm text-red-500 mt-1">{errors.formatted_address}</p>
        )}
      </div>

      {/* Auto-populated Address Fields */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm text-muted-foreground">
            ✨ Fields below will auto-populate when you select an address above, but you can edit them manually
          </div>
          <InfoTooltip
            content="Address autocomplete intelligently parses and fills structured address fields. You can manually edit any field if needed."
            impact="Auto-population reduces data entry errors and ensures consistent address formatting across projects."
            side="right"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={data.street}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              placeholder="123 Main St"
              className={data.street ? "bg-green-50 border-green-200" : ""}
            />
            {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              placeholder="City"
              className={data.city ? "bg-green-50 border-green-200" : ""}
            />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={data.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              placeholder="State or Province"
              className={data.state ? "bg-green-50 border-green-200" : ""}
            />
            {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
          </div>

          <div>
            <Label htmlFor="postal_code">ZIP / Postal Code</Label>
            <Input
              id="postal_code"
              value={data.postal_code}
              onChange={(e) => handleFieldChange('postal_code', e.target.value)}
              placeholder="12345"
              className={data.postal_code ? "bg-green-50 border-green-200" : ""}
            />
            {errors.postal_code && <p className="text-sm text-red-500 mt-1">{errors.postal_code}</p>}
          </div>
        </div>
      </div>

      {/* Country Field */}
      <div>
        <Label htmlFor="country">Country</Label>
        <select
          id="country"
          value={data.country}
          onChange={(e) => handleFieldChange('country', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            data.country ? "bg-green-50 border-green-200" : "border-input bg-background"
          }`}
        >
          <option value="">Select country</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="India">India</option>
          <option value="Mexico">Mexico</option>
          <option value="Brazil">Brazil</option>
        </select>
        {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
      </div>

      {/* Coordinates - Optional Display */}
      {showCoordinates && (data.latitude || data.longitude) && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>📍 Coordinates: {data.latitude}, {data.longitude}</span>
            <a
              href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on map
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressForm;