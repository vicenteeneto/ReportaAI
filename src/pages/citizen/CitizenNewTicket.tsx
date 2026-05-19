import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { Camera, MapPin, CheckCircle2, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon default
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Utilities ───────────────────────────────────────────────────────────────

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch (_) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Photo compression: handled by browser-image-compression library

/**
 * Upload a file via XMLHttpRequest — the most reliable method on Android.
 * Supabase Storage REST API expects the raw file bytes as the request body.
 * (FormData/multipart is NOT supported by Supabase Storage.)
 */
function uploadViaXHR(
  file: File,
  fileName: string,
  supabaseUrl: string,
  authToken: string,
  bucketName: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${encodeURIComponent(fileName)}`;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    // Auth header
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    // Supabase Storage needs the MIME type as Content-Type on the raw body
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    // Do NOT upsert — always new file
    xhr.setRequestHeader('x-upsert', 'false');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Construct public URL directly — no extra fetch needed
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${encodeURIComponent(fileName)}`;
        resolve(publicUrl);
      } else {
        let errMsg = `HTTP ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          errMsg = parsed?.message || parsed?.error || errMsg;
        } catch (_) {}
        reject(new Error(`Upload falhou: ${errMsg}`));
      }
    };

    xhr.onerror = () => reject(new Error('Falha de rede no upload (XHR onerror)'));
    xhr.ontimeout = () => reject(new Error('Upload cancelado por timeout'));
    xhr.timeout = 90000; // 90s — generous for slow 3G connections

    // Send raw binary — this is what Supabase Storage REST API expects
    xhr.send(file);
  });
}

/**
 * Get Supabase auth token synchronously from localStorage.
 * Avoids a secondary async fetch call that can also hang on Android.
 */
function getStoredAuthToken(supabaseUrl: string, fallback: string): string {
  try {
    // Supabase stores the session under the key: sb-<project-ref>-auth-token
    // Extract project ref from URL: https://XXXXXX.supabase.co
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const key = `sb-${projectRef}-auth-token`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token;
      if (token) return token;
    }
  } catch (_) {}
  return fallback;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CitizenNewTicket() {
  const navigate = useNavigate();
  const { categories, currentUser, addTicket, cities } = useAppContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newProtocol, setNewProtocol] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    address: '',
    neighborhood: '',
    priority: 'medium' as any,
    cityId: undefined as string | undefined,
    photoUrl: undefined as string | undefined,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitStatusText, setSubmitStatusText] = useState('');

  // Address Autocomplete and Map states
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const [showMap, setShowMap] = useState(false);

  // Photo state: compressed blob (ready for upload) + compression status
  const [compressedPhoto, setCompressedPhoto] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Close autocomplete dropdown on outside click
  const addressWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setAddressSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manual Map Marker Component
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng }));
        // reverse geocode upon manual click
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const road = data.address.road || data.address.pedestrian || '';
              const suburb = data.address.suburb || data.address.neighbourhood || '';
              setFormData(prev => ({
                 ...prev,
                 address: road || prev.address,
                 neighborhood: suburb || prev.neighborhood
              }));
            }
          }).catch(err => console.error("Erro geocoding reverso (click):", err));
      },
    });

    useEffect(() => {
      if (formData.latitude && formData.longitude) {
         map.flyTo([formData.latitude, formData.longitude], map.getZoom());
      }
    }, [formData.latitude, formData.longitude, map]);

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoUrl);
      }
    };
  }, [formData.photoUrl]);

  // ─── Photo handler: compress IMMEDIATELY on capture ───
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Reset so Android allows re-selection

    if (!file) return;

    // Revoke old preview
    if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.photoUrl);
    }

    // Normalize MIME type (some Android cameras return empty string)
    const safeFile = (file.type && file.type.startsWith('image/'))
      ? file
      : new File([file], file.name || 'photo.jpg', { type: 'image/jpeg' });

    // Show instant preview from original file
    const previewUrl = URL.createObjectURL(safeFile);
    setFormData(prev => ({...prev, photoUrl: previewUrl}));
    setCompressedPhoto(null);
    setIsCompressing(true);

    // Compression: useWebWorker: FALSE is critical for Android PWA/WebViews
    // Web Workers are frequently blocked in Android Chrome PWA mode
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: false,         // <-- must be false for Android
      initialQuality: 0.8,
      fileType: 'image/jpeg' as const
    };

    imageCompression(safeFile, options)
      .then((compressedFile) => {
        setCompressedPhoto(compressedFile);
        const compressedUrl = URL.createObjectURL(compressedFile);
        URL.revokeObjectURL(previewUrl);
        setFormData(prev => ({...prev, photoUrl: compressedUrl}));
      })
      .catch((err) => {
        // If compression fails, use original file — never block the flow
        console.warn('Compressão falhou, usando arquivo original:', err);
        setCompressedPhoto(safeFile);
      })
      .finally(() => {
        setIsCompressing(false);
      });
  };

  // ─── Remove photo ───
  const handleRemovePhoto = () => {
    if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.photoUrl);
    }
    setCompressedPhoto(null);
    setIsCompressing(false);
    setFormData(prev => ({...prev, photoUrl: undefined}));
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.categoryId) { setErrorMsg('Por favor, selecione uma categoria.'); return; }

    setIsSubmitting(true);
    setSubmitProgress(10);
    setSubmitStatusText('Iniciando envio...');
    
    try {
      const userId = currentUser?.id;
      if (!userId) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

      let uploadedPhotoUrl: string | undefined = undefined;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Get auth token synchronously from localStorage — avoids a secondary fetch that also hangs on Android
      const authToken = getStoredAuthToken(supabaseUrl, anonKey);

      // ── Photo upload ──
      let photoBlob = compressedPhoto;

      if (photoBlob) {
        setSubmitProgress(20);
        setSubmitStatusText('Enviando foto...');

        const fileName = `${Date.now()}-${userId}.jpg`;

        // Always create a clean File object with explicit JPEG type
        const fileToUpload = new File([photoBlob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        // Upload via XHR — most reliable on Android (fetch/SDK can hang in PWA mode)
        uploadedPhotoUrl = await uploadViaXHR(
          fileToUpload,
          fileName,
          supabaseUrl,
          authToken,
          'tickets',
          (pct) => {
            // Map XHR progress (0→100) to our UI range (20→80)
            setSubmitProgress(20 + Math.round(pct * 0.6));
          }
        );
      }

      setSubmitProgress(85);
      setSubmitStatusText('Gerando protocolo...');

      // ── Protocol number ──
      let nextNum = Math.floor(Math.random() * 900000) + 100000; // Fallback caso dê erro de rede
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s limite
        
        const res = await fetch(`${supabaseUrl}/rest/v1/tickets?select=*&limit=1`, {
          method: 'HEAD',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Prefer': 'count=exact'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const contentRange = res.headers.get('content-range');
          if (contentRange) {
            // content-range vem no formato "0-0/42" (onde 42 é o total de linhas)
            const match = contentRange.match(/\/(\d+)$/);
            if (match && match[1]) {
              nextNum = parseInt(match[1], 10) + 1;
            }
          }
        }
      } catch (err) {
        console.warn('A contagem falhou, usando número aleatório de fallback:', err);
      }

      const generatedProtocol = `RD-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
      
      setSubmitProgress(95);
      setSubmitStatusText('Salvando registro...');

      // ── Create ticket ──
      const newTicket: Ticket = {
        id: generateUUID(),
        protocol: generatedProtocol,
        userId: userId,
        categoryId: formData.categoryId,
        departmentId: categories.find(c => c.id === formData.categoryId)?.defaultDepartmentId || 'dep-infra',
        title: formData.title,
        description: formData.description,
        address: formData.address || 'Localização não informada',
        neighborhood: formData.neighborhood || 'Bairro Não Informado',
        cityId: formData.cityId || currentUser?.cityId || '11111111-1111-1111-1111-111111111111',
        priority: categories.find(c => c.id === formData.categoryId)?.defaultPriority || 'medium',
        status: 'received',
        latitude: formData.latitude || -16.4716 + (Math.random() * 0.01 - 0.005),
        longitude: formData.longitude || -54.6369 + (Math.random() * 0.01 - 0.005),
        photoUrl: uploadedPhotoUrl,
        createdAt: Date.now()
      };

      await addTicket(newTicket);
      
      setSubmitProgress(100);
      setSubmitStatusText('Concluído!');
      
      // Pequeno delay para o usuário ver o 100%
      setTimeout(() => {
        setNewProtocol(generatedProtocol);
        setSuccess(true);
      }, 400);
      
    } catch (err: any) {
      console.error("Error creating ticket", err);
      const msg = err?.message || 'Erro ao salvar chamado.';
      setErrorMsg(msg);
      // Also alert as backup (works on iOS; may be suppressed on Android PWA)
      try { alert('Atenção: ' + msg); } catch (_) {}
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
      setSubmitStatusText('');
    }
  };

  // ─── Geolocation ───
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
            }
          });
          const data = await response.json();
          
          let addressLocal = '';
          let neighborhoodLocal = '';
          let foundCityId: string | undefined = undefined;

          if (data && data.address) {
             const road = data.address.road || '';
             const houseNumber = data.address.house_number || '';
             const suburb = data.address.suburb || data.address.neighbourhood || '';
             const cityStr = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
             
             if (road) {
               addressLocal = houseNumber ? `${road}, ${houseNumber}` : road;
             }
             if (suburb) {
               neighborhoodLocal = cityStr ? `${suburb} - ${cityStr}` : suburb;
             } else if (cityStr) {
               neighborhoodLocal = cityStr;
             }
             
             // Try to find the city in our database by name (case-insensitive, ignoring accents if possible, but exact match for now or substring)
             if (cityStr) {
               const matchedCity = cities.find(c => 
                 c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
                 cityStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
               );
               if (matchedCity) {
                 foundCityId = matchedCity.id;
               }
             }
          }

          setFormData(prev => ({
            ...prev, 
            latitude: lat,
            longitude: lng,
            address: prev.address || addressLocal || `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            neighborhood: prev.neighborhood || neighborhoodLocal,
            cityId: foundCityId || prev.cityId
          }));
        } catch (e) {
          console.error("Reverse geocoding failed", e);
          setFormData(prev => ({
            ...prev, 
            latitude: lat,
            longitude: lng,
            address: `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          }));
        } finally {
          setIsLocating(false);
        }
      }, 
      (err) => {
        setIsLocating(false);
        alert('Não foi possível acessar a localização. Verifique as permissões de GPS.');
      },
      { timeout: 15100, enableHighAccuracy: true }
    );
  };

  // ─── Autocomplete Handlers ───
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 4) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=br&format=json&addressdetails=1&limit=8`;
      const response = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
      const data = await response.json();
      
      // Filtra primariamente pelas cidades do sistema se achar, senão mostra todos
      const filtered = data.filter((d: any) => {
        const c = d.address?.city || d.address?.town || d.address?.municipality || '';
        return c.includes('Rondonópolis') || c.includes('Itajaí');
      });
      
      setAddressSuggestions(filtered.length > 0 ? filtered : data);
    } catch (e) {
      console.error("Autocomplete failed", e);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({...prev, address: value}));
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 600);
  };

  const selectAddress = (suggestion: any) => {
    const addr = suggestion.address;
    const road = addr.road || addr.pedestrian || '';
    const suburb = addr.suburb || addr.neighbourhood || '';
    
    // Attempt to match city ID if available
    const cityStr = addr.city || addr.town || addr.village || addr.municipality || '';
    let foundCityId = formData.cityId;
    if (cityStr) {
      const matchedCity = cities.find(c => 
        c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
        cityStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
      if (matchedCity) foundCityId = matchedCity.id;
    }

    setFormData(prev => ({
      ...prev,
      address: road || suggestion.name,
      neighborhood: suburb || prev.neighborhood,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      cityId: foundCityId
    }));
    setAddressSuggestions([]);
    
    // Automatically show map if they select an address, so they can verify
    setShowMap(true);
  };

  // ─── Success screen ───
  if (success) {
    return (
      <div className="p-4 md:p-6 lg:max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 font-sans">
        <div className="w-20 h-20 bg-green-50 rounded border border-green-200 flex items-center justify-center text-green-600 mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Chamado Efetuado</h2>
        <div className="bg-slate-100 border border-slate-200 rounded p-4 w-full">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Seu Protocolo</p>
          <p className="text-xl font-bold tracking-widest text-[#1E3A8A] font-mono">{newProtocol}</p>
        </div>
        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
          Sua solicitação foi registrada e encaminhada para a secretaria correspondente. Acompanhe a resolução.
        </p>
        <div className="w-full space-y-2 pt-2">
          <Button className="w-full font-bold uppercase tracking-wide text-xs h-12" onClick={() => navigate('/citizen/tickets')}>
            Acompanhar Solicitação
          </Button>
          <Button variant="outline" className="w-full font-bold uppercase tracking-wide text-xs h-12 border-slate-300" onClick={() => navigate('/citizen')}>
            Retornar
          </Button>
        </div>
      </div>
    );
  }

  // ─── Form ───
  return (
    <div className="p-4 md:p-6 lg:max-w-2xl mx-auto space-y-6 font-sans">
      <button 
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
      </button>

      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Nova Ocorrência</h2>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Error banner — always visible on screen, never suppressed unlike alert() */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 flex items-start gap-2">
            <span className="text-red-500 font-bold text-base leading-none mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">Erro ao enviar</p>
              <p className="text-[11px] text-red-600 leading-relaxed break-words">{errorMsg}</p>
            </div>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none px-1">×</button>
          </div>
        )}

          <div className="space-y-5 animate-in slide-in-from-right-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Qual problema você identificou?</label>
              <Select 
                required 
                value={formData.categoryId} 
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Selecione uma categoria...</option>
                {categories.filter(cat => {
                   const activeCityId = formData.cityId || currentUser?.cityId || '11111111-1111-1111-1111-111111111111';
                   return cat.cityId === activeCityId || !cat.cityId || cat.id === formData.categoryId;
                }).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Registro Fotográfico Físico (Opcional)</label>
              {!formData.photoUrl ? (
                <div className="grid grid-cols-2 gap-3 h-28">
                  <label className="border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group text-center p-2">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                    <Camera className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500 leading-tight">Câmera</span>
                  </label>
                  
                  <label className="border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group text-center p-2">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <Upload className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500 leading-tight">Escolher Foto</span>
                  </label>
                </div>
              ) : (
                <div className="relative h-48 rounded overflow-hidden border border-slate-200 bg-slate-100 group">
                  <img 
                    src={formData.photoUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => setViewingImage(formData.photoUrl || null)}
                  />
                  {/* Compression overlay indicator */}
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white z-10">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Processando foto...</span>
                    </div>
                  )}
                  <button 
                    type="button" 
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Título (Resumo)</label>
              <Input 
                placeholder="Ex: Buraco na via pública" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Descrição Detalhada</label>
              <Textarea 
                placeholder="Descreva detalhes que ajudem a equipe..." 
                className="h-28"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <p className="text-[9px] text-slate-500 font-medium">Os dados informados alimentam o sistema central da prefeitura.</p>
            </div>

            <div className="space-y-1.5 relative" ref={addressWrapperRef}>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Endereço do Local</span>
                <button 
                  type="button" 
                  onClick={() => setShowMap(!showMap)} 
                  className="text-[#1E3A8A] hover:underline"
                >
                  {showMap ? 'Ocultar Mapa' : 'Selecionar no Mapa'}
                </button>
              </label>
              
              <div className="flex gap-2 relative">
                <Input 
                  placeholder="Digite o endereço para buscar..." 
                  className="flex-1"
                  required
                  value={formData.address}
                  onChange={handleAddressInputChange}
                  autoComplete="off"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3 border-slate-300 bg-white min-w-[50px]" 
                  title="Meu Local Atual (GPS)"
                  disabled={isLocating}
                  onClick={handleGetLocation}
                >
                  {isLocating ? <Loader2 className="w-5 h-5 text-[#1E3A8A] animate-spin" /> : <MapPin className="w-5 h-5 text-[#1E3A8A]" />}
                </Button>
              </div>

              {/* Autocomplete Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1 divide-y divide-slate-100">
                  {addressSuggestions.map((sug, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectAddress(sug)}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-bold text-slate-800 truncate">{sug.address?.road || sug.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                        {sug.address?.suburb || sug.address?.neighbourhood || 'Bairro Indefinido'} - {sug.address?.city || sug.address?.town || ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {isSearchingAddress && (
                 <p className="text-[10px] text-slate-400 absolute -bottom-4 right-0">Buscando...</p>
              )}
            </div>

            {/* Manual Pin Map */}
            {showMap && (
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-300 shadow-inner relative animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-slate-700 pointer-events-none">
                  Toque no mapa para ajustar o pino
                </div>
                <MapContainer 
                  center={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [-16.4672, -54.6383]} 
                  zoom={15} 
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              </div>
            )}
             <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Bairro</label>
              <Input 
                placeholder="Ex. Centro" 
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>

            <div className="pt-4">
              {isSubmitting ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">{submitStatusText}</span>
                    <span className="text-[10px] font-bold text-slate-500">{submitProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#1E3A8A] h-full transition-all duration-300 ease-out" 
                      style={{ width: `${submitProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <Button type="submit" className="w-full font-bold uppercase tracking-wide text-[10px] h-12" disabled={isCompressing}>
                  {isCompressing ? 'Processando foto...' : 'Confirmar Solicitação'}
                </Button>
              )}
            </div>
          </div>
      </form>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
            <button onClick={() => setViewingImage(null)} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={viewingImage} alt="Fullscreen preview" className="max-w-full max-h-full object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
