import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

declare global { interface Window { google?: any } }

export type AddressData = {
  formatted_address: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  lat?: number;
  lon?: number;
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAddressSelect: (address: AddressData) => void;
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  className?: string;
  countryBias?: string; // ISO 2-letter (e.g., 'US')
}

const GOOGLE_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export const AddressAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter full address",
  minLength = 3,
  debounceMs = 350,
  className,
  countryBias = 'US',
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const timer = useRef<number | null>(null);
  const googleReadyRef = useRef(false);

  const ensureGoogle = async (): Promise<boolean> => {
    if (!GOOGLE_KEY) return false;
    if (googleReadyRef.current && window.google?.maps?.places) return true;
    await new Promise<void>((resolve, reject) => {
      if (document.getElementById('google-places-sdk')) return resolve();
      const s = document.createElement('script');
      s.id = 'google-places-sdk';
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(s);
    }).catch(() => {});
    if (window.google?.maps?.places) {
      googleReadyRef.current = true;
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!value || value.length < minLength) { setResults([]); setOpen(false); return; }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        if (await ensureGoogle()) {
          const svc = new window.google.maps.places.AutocompleteService();
          const req: any = { 
            input: value,
            types: ['address'] // Only search for full addresses
          };
          if (countryBias) req.componentRestrictions = { country: countryBias.toLowerCase() } as any;
          svc.getPlacePredictions(req, (preds: any[], status: any) => {
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !preds) {
              setResults([]); setOpen(false); setLoading(false); return;
            }
            setResults(preds.map(p => ({ description: p.description, place_id: p.place_id })));
            setOpen(true); setLoading(false);
          });
          return;
        }
        // Fallback to Nominatim search with enhanced query
        const searchQuery = value.includes(',') ? value : `${value}, ${countryBias === 'US' ? 'United States' : countryBias === 'CA' ? 'Canada' : ''}`;
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1${countryBias ? `&countrycodes=${countryBias.toLowerCase()}` : ''}`);
        const data = await resp.json();
        setResults((data || []).map((d: any) => ({ 
          description: d.display_name, 
          lat: parseFloat(d.lat), 
          lon: parseFloat(d.lon),
          address: d.address // Include address components from Nominatim
        })));
        setOpen(true);
      } catch {
        setResults([]); setOpen(false);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [value, minLength, debounceMs]);

  const handlePick = async (item: any) => {
    // If Google, fetch details for geometry + components
    if (item.place_id && window.google?.maps?.places) {
      try {
        const svc = new window.google.maps.places.PlacesService(document.createElement('div'));
        await new Promise<void>((resolve) => {
          svc.getDetails({ placeId: item.place_id, fields: ['geometry','formatted_address','address_components'] }, (place: any) => {
            const lat = place?.geometry?.location?.lat?.();
            const lng = place?.geometry?.location?.lng?.();
            const comps: any[] = place?.address_components || [];
            const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
            const getShort = (type: string) => comps.find(c => c.types.includes(type))?.short_name || '';
            
            const streetNumber = get('street_number');
            const route = get('route');
            
            // Enhanced city detection with multiple fallbacks
            const locality = get('locality') || 
                            get('sublocality_level_1') || 
                            get('sublocality') || 
                            get('postal_town') ||
                            get('administrative_area_level_3') ||
                            get('administrative_area_level_2');
            
            // Enhanced state detection - prefer short names for US states
            const adminArea = getShort('administrative_area_level_1') || get('administrative_area_level_1');
            const postal = get('postal_code');
            const country = get('country');
            onAddressSelect({
              formatted_address: place?.formatted_address || item.description,
              street: [streetNumber, route].filter(Boolean).join(' '),
              city: locality,
              state: adminArea,
              postal_code: postal,
              country: country,
              lat,
              lon: lng,
            });
            resolve();
          });
        });
        setOpen(false);
        return;
      } catch {}
    }
    // Nominatim selected item - enhanced address parsing
    let street = '', city = '', state = '', postalCode = '', country = '';
    
    // If we have structured address data from Nominatim, use it
    if (item.address) {
      street = [item.address.house_number, item.address.road].filter(Boolean).join(' ') || 
               item.address.pedestrian || 
               item.address.path || '';
      city = item.address.city || 
             item.address.town || 
             item.address.village || 
             item.address.municipality || 
             item.address.hamlet || '';
      state = item.address.state || 
              item.address.province || 
              item.address.region || 
              item.address.county || '';
      postalCode = item.address.postcode || '';
      country = item.address.country || '';
    } else {
      // Fallback to parsing display_name
      const parts = (item.description || '').split(',').map((s: string) => s.trim());
      country = parts.pop() || '';
      const stateZipPart = parts.pop() || '';
      city = parts.pop() || '';
      street = parts.join(', ');
      
      // Enhanced postal code extraction for multiple formats
      state = stateZipPart;
      
      // US ZIP format (12345 or 12345-6789)
      const usZipMatch = stateZipPart.match(/\b\d{5}(-\d{4})?\b/);
      if (usZipMatch) {
        postalCode = usZipMatch[0];
        state = stateZipPart.replace(/\b\d{5}(-\d{4})?\b/, '').trim();
      }
      // UK postal code format (SW1A 1AA)
      else if (/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(stateZipPart.split(' ').pop() || '')) {
        const ukParts = stateZipPart.split(' ');
        if (ukParts.length >= 2) {
          postalCode = ukParts.slice(-2).join(' ');
          state = ukParts.slice(0, -2).join(' ');
        }
      }
      // Canadian postal code format (K1A 0A6)
      else if (/^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i.test(stateZipPart.split(' ').pop() || '')) {
        const caParts = stateZipPart.split(' ');
        if (caParts.length >= 2) {
          postalCode = caParts.slice(-2).join(' ');
          state = caParts.slice(0, -2).join(' ');
        }
      }
      // Generic number-only postal codes (for other countries)
      else {
        const genericMatch = stateZipPart.match(/\b\d{3,6}\b/);
        if (genericMatch) {
          postalCode = genericMatch[0];
          state = stateZipPart.replace(/\b\d{3,6}\b/, '').trim();
        }
      }
      
      // Clean up state field
      state = state.replace(/^[,\s]+|[,\s]+$/g, ''); // Remove leading/trailing commas and spaces
    }
    
    onAddressSelect({
      formatted_address: item.description,
      street,
      city,
      state,
      postal_code: postalCode,
      country,
      lat: item.lat,
      lon: item.lon,
    });
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
      {open && results.length > 0 && (
        <div className="absolute z-10 left-0 right-0 mt-1 max-h-60 overflow-auto rounded border bg-background shadow">
          {results.map((r, idx) => (
            <button
              key={`${r.description}-${r.place_id || r.lat || idx}`}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-accent text-sm"
              onClick={() => handlePick(r)}
            >
              {r.description}
            </button>
          ))}
          <div className="px-3 py-1 text-xs text-muted-foreground border-t">
            {googleReadyRef.current ? 'Results by Google Places' : 'Results by OpenStreetMap'}
          </div>
        </div>
      )}
      {loading && <div className="absolute right-2 top-2 text-xs text-muted-foreground">…</div>}
    </div>
  );
};

export default AddressAutocomplete;
