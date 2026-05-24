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
  const attemptUpload = (useArrayBuffer: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${encodeURIComponent(fileName)}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
  
      xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');
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
  
      // XHR onerror occurs for network interruption, CORS issues, or browser-level request cancellations (ex: memory bounds)
      xhr.onerror = () => reject(new Error('Falha de rede no upload (XHR onerror)'));
      xhr.ontimeout = () => reject(new Error('Upload cancelado por timeout'));
      xhr.timeout = 60000; 
  
      if (useArrayBuffer) {
        file.arrayBuffer()
          .then(buffer => xhr.send(buffer))
          .catch(err => reject(new Error(`Falha ao ler arquivo: ${err.message || err}`)));
      } else {
        // Envio direto do arquivo, usa streaming do browser, gasta pouca RAM
        xhr.send(file);
      }
    });
  };

  // 1º Tentamos enviar diretamente como blob/file (usando xhr.send(file)). 
  // É mais leve em memória e evita crashes de RAM em celulares Android mais simples.
  return attemptUpload(false)
    .catch((err) => {
      console.warn("Upload direto falhou, tentando via ArrayBuffer (fallback):", err);
      // 2º Se falhar (ex: problemas em alguns Webviews mais antigos com URIs originais `content://`),
      // tentamos carregar primeiro na memória e enviar como ArrayBuffer
      return attemptUpload(true);
    })
    .catch((err2) => {
      console.warn("Upload via ArrayBuffer também falhou, tentando Supabase SDK:", err2);
      // 3º Fallback final: Fetch / Supabase SDK padrão
      return new Promise((resolve, reject) => {
        supabase.storage
          .from(bucketName)
          .upload(fileName, file, { contentType: 'image/jpeg', upsert: false })
          .then(({ data, error }) => {
            if (error) reject(new Error(error.message));
            else if (data) {
              const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
              resolve(publicUrl);
            }
          })
          .catch(reject);
      });
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

  const [photos, setPhotos] = useState<{file: File | Blob; previewUrl: string}[]>([]);
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

  // ── Structured address state ──
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [neighborhoodSugs, setNeighborhoodSugs] = useState<any[]>([]);
  const [isSearchingNbhd, setIsSearchingNbhd] = useState(false);
  const nbhdTimeoutRef = useRef<any>(null);
  const nbhdRef = useRef<HTMLDivElement>(null);

  const [streetSearch, setStreetSearch] = useState('');
  const [streetSugs, setStreetSugs] = useState<any[]>([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const streetTimeoutRef = useRef<any>(null);
  const streetRef = useRef<HTMLDivElement>(null);

  const [houseNumber, setHouseNumber] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCityDropdown(false);
      if (nbhdRef.current && !nbhdRef.current.contains(e.target as Node)) setNeighborhoodSugs([]);
      if (streetRef.current && !streetRef.current.contains(e.target as Node)) setStreetSugs([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // City helper
  const CITY_STATE: Record<string, string> = { 'Rondonópolis': 'MT', 'Itajaí': 'SC', 'Cuiabá': 'MT' };
  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    (c.state || '').toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectCity = (city: any) => {
    setFormData(prev => ({ ...prev, cityId: city.id }));
    setCitySearch(`${city.name} — ${city.state || CITY_STATE[city.name] || ''}`);
    setShowCityDropdown(false);
    setNeighborhoodSearch(''); setNeighborhoodSugs([]);
    setStreetSearch(''); setStreetSugs([]);
    setHouseNumber('');
  };

  // Photo state
  const [isCompressing, setIsCompressing] = useState(false);

  // Neighborhood search (Nominatim)
  const fetchNeighborhoodSugs = async (query: string) => {
    const city = cities.find(c => c.id === formData.cityId);
    if (!query || query.length < 2 || !city) { setNeighborhoodSugs([]); return; }
    setIsSearchingNbhd(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' ' + city.name)}&countrycodes=br&format=json&addressdetails=1&limit=8`;
      const data = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } }).then(r => r.json());
      const sugs = data.filter((d: any) => d.address?.suburb || d.address?.neighbourhood || d.address?.residential || d.address?.quarter);
      setNeighborhoodSugs(sugs.length > 0 ? sugs : data.slice(0, 5));
    } catch (e) { console.error(e); } finally { setIsSearchingNbhd(false); }
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNeighborhoodSearch(val);
    setFormData(prev => ({ ...prev, neighborhood: val }));
    if (nbhdTimeoutRef.current) clearTimeout(nbhdTimeoutRef.current);
    nbhdTimeoutRef.current = setTimeout(() => fetchNeighborhoodSugs(val), 500);
  };

  const selectNeighborhood = (sug: any) => {
    const name = sug.address?.suburb || sug.address?.neighbourhood || sug.address?.residential || sug.name;
    setNeighborhoodSearch(name);
    setFormData(prev => ({ ...prev, neighborhood: name }));
    setNeighborhoodSugs([]);
  };

  // Street search (ViaCEP)
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const fetchStreetSugs = async (query: string) => {
    const city = cities.find(c => c.id === formData.cityId);
    if (!query || query.length < 4 || !city) { setStreetSugs([]); return; }
    const stateCode = city.state || CITY_STATE[city.name] || '';
    if (!stateCode) return;
    setIsSearchingStreet(true);
    try {
      const url = `https://viacep.com.br/ws/${stateCode}/${encodeURIComponent(norm(city.name))}/${encodeURIComponent(norm(query))}/json/`;
      const res = await fetch(url);
      if (!res.ok) { setStreetSugs([]); return; }
      const data = await res.json();
      setStreetSugs(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (e) { console.error(e); setStreetSugs([]); } finally { setIsSearchingStreet(false); }
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStreetSearch(val);
    setFormData(prev => ({ ...prev, address: houseNumber ? `${val}, ${houseNumber}` : val }));
    if (streetTimeoutRef.current) clearTimeout(streetTimeoutRef.current);
    streetTimeoutRef.current = setTimeout(() => fetchStreetSugs(val), 600);
  };

  const selectStreet = async (s: any) => {
    const street = s.logradouro || '';
    const bairro = s.bairro || '';
    setStreetSearch(street);
    setFormData(prev => ({ ...prev, address: houseNumber ? `${street}, ${houseNumber}` : street, neighborhood: bairro || prev.neighborhood }));
    if (bairro) setNeighborhoodSearch(bairro);
    setStreetSugs([]);
    // Geocode via CEP
    if (s.cep) {
      try {
        const cep = s.cep.replace('-', '');
        const geo = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=BR&format=json&limit=1`).then(r => r.json());
        if (geo.length > 0) {
          setFormData(prev => ({ ...prev, latitude: parseFloat(geo[0].lat), longitude: parseFloat(geo[0].lon) }));
        }
      } catch (e) { console.warn('CEP geocode failed', e); }
    }
  };

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
      photos.forEach(p => {
        if (p.previewUrl.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, [photos]);

  // ─── Photo handler: compress IMMEDIATELY on capture ───
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    e.target.value = ''; // Reset so Android allows re-selection

    if (files.length === 0) return;

    // Limit to max 3 photos to prevent out of memory issues
    const allowedNewFiles = files.slice(0, 3 - photos.length);
    if (allowedNewFiles.length === 0) return;

    setIsCompressing(true);

    try {
      for (const file of allowedNewFiles) {
        // Normalize MIME type
        const mimeType = (file.type && file.type.startsWith('image/')) ? file.type : 'image/jpeg';
        const safeFile = new File([file], file.name || 'photo.jpg', { type: mimeType });
        
        let compressedFile: File | Blob = safeFile;
        // Show temp preview fallback if compression fails
        let finalPreviewUrl = URL.createObjectURL(safeFile);

        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: false, // <-- must be false for Android WebViews to avoid bugs
          initialQuality: 0.8,
          fileType: 'image/jpeg' as const
        };

        try {
          compressedFile = await imageCompression(safeFile, options);
          const compressedUrl = URL.createObjectURL(compressedFile);
          URL.revokeObjectURL(finalPreviewUrl);
          finalPreviewUrl = compressedUrl;
        } catch (err) {
          console.warn('browser-image-compression falhou:', err);
        }
        
        setPhotos(prev => [...prev, { file: compressedFile, previewUrl: finalPreviewUrl }]);
      }
    } catch (fatal) {
      console.error("Erro fatal ao processar foto:", fatal);
    } finally {
      setIsCompressing(false);
    }
  };

  // ─── Remove photo ───
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const newUrls = [...prev];
      const removed = newUrls.splice(index, 1)[0];
      if (removed && removed.previewUrl.startsWith('blob:')) {
         URL.revokeObjectURL(removed.previewUrl);
      }
      return newUrls;
    });
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
      const uploadedUrls: string[] = [];
      const totalPhotos = photos.length;

      if (totalPhotos > 0) {
        let currentPhotoIdx = 0;
        
        for (const photo of photos) {
          setSubmitProgress(20 + Math.round((currentPhotoIdx / totalPhotos) * 60));
          setSubmitStatusText(totalPhotos > 1 ? `Enviando foto ${currentPhotoIdx + 1} de ${totalPhotos}...` : 'Enviando foto...');

          const fileName = `${Date.now()}-${userId}-${currentPhotoIdx}.jpg`;
          const fileToUpload = new File([photo.file], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // Upload via XHR — most reliable on Android (fetch/SDK can hang in PWA mode)
          const singleUrl = await uploadViaXHR(
            fileToUpload,
            fileName,
            supabaseUrl,
            authToken,
            'tickets',
            (pct) => {
              // Map chunk progress
              const basePct = 20 + Math.round((currentPhotoIdx / totalPhotos) * 60);
              const chunkPctLength = 60 / totalPhotos;
              setSubmitProgress(basePct + Math.round((pct / 100) * chunkPctLength));
            }
          );
          
          if (singleUrl) {
            uploadedUrls.push(singleUrl);
          }
          currentPhotoIdx++;
        }
      }

      uploadedPhotoUrl = uploadedUrls.length > 0 ? uploadedUrls.join(',') : undefined;

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

      // Breve pausa para o Android WebView esvaziar a fila de sockets e memory da XHR upload (evita travamento no PostgREST)
      await new Promise(r => setTimeout(r, 800));

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
             const road = data.address.road || data.address.pedestrian || '';
             const houseNum = data.address.house_number || '';
             const suburb = data.address.suburb || data.address.neighbourhood || '';
             const cityStr = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
             
             if (road) {
               addressLocal = houseNum ? `${road}, ${houseNum}` : road;
               setStreetSearch(road);
               if (houseNum) setHouseNumber(houseNum);
             }
             if (suburb) {
               neighborhoodLocal = cityStr ? `${suburb} - ${cityStr}` : suburb;
               setNeighborhoodSearch(neighborhoodLocal);
             } else if (cityStr) {
               neighborhoodLocal = cityStr;
               setNeighborhoodSearch(neighborhoodLocal);
             }
             
             // Try to find the city in our database by name (case-insensitive, ignoring accents if possible, but exact match for now or substring)
             if (cityStr) {
               const matchedCity = cities.find(c => 
                 c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
                 cityStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
               );
               if (matchedCity) {
                 foundCityId = matchedCity.id;
                 setCitySearch(matchedCity.name);
               } else {
                 setCitySearch(cityStr);
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

  // (address handlers replaced by structured city/neighborhood/street flow below)

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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Registro Fotográfico (Até 3)</span>
                <span className="text-slate-400">{photos.length}/3</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative h-28 rounded overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img 
                      src={photo.previewUrl} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                      onClick={() => setViewingImage(photo.previewUrl)}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition-colors z-20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {photos.length < 3 && (
                  <>
                  <label className="h-28 border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group text-center p-2">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                    <Camera className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500 leading-tight">Câmera</span>
                  </label>
                  <label className="h-28 border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group text-center p-2">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <Upload className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500 leading-tight">Galeria</span>
                  </label>
                  </>
                )}
              </div>

              {isCompressing && (
                <div className="flex items-center justify-center gap-2 text-blue-600 animate-pulse mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Processando fotos...</span>
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

            {/* ─── LOCALIZAÇÃO ─── */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/60">
              <div className="flex justify-between items-center w-full mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest content-center">📍 Localização da Ocorrência</p>
                <button type="button" onClick={handleGetLocation} disabled={isLocating} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  {isLocating ? 'Buscando...' : 'Obter pelo GPS'}
                </button>
              </div>

              {/* 1. CIDADE */}
              <div className="space-y-1 relative" ref={cityRef}>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Cidade</label>
                <Input
                  placeholder="Selecione ou busque a cidade..."
                  value={citySearch}
                  onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => setShowCityDropdown(true)}
                  autoComplete="off"
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {filteredCities.map((city: any) => (
                      <div key={city.id} onClick={() => selectCity(city)} className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-slate-800">{city.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{city.state || CITY_STATE[city.name]} — {city.state ? 'Brasil' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. BAIRRO */}
              <div className="space-y-1 relative" ref={nbhdRef}>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Bairro {isSearchingNbhd && <span className="text-slate-400 font-normal">(buscando...)</span>}
                </label>
                <Input
                  placeholder="Digite o bairro..."
                  value={neighborhoodSearch}
                  onChange={handleNeighborhoodChange}
                  autoComplete="off"
                  required
                />
                {neighborhoodSugs.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {neighborhoodSugs.map((s, i) => {
                      const name = s.address?.suburb || s.address?.neighbourhood || s.address?.residential || s.name;
                      return (
                        <div key={i} onClick={() => selectNeighborhood(s)} className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors">
                          <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.display_name}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. RUA */}
              <div className="space-y-1 relative" ref={streetRef}>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
                  <span>Logradouro / Rua {isSearchingStreet && <span className="text-slate-400 font-normal">(buscando...)</span>}</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Avenida Tiradentes..."
                    value={streetSearch}
                    onChange={handleStreetChange}
                    autoComplete="off"
                    className="flex-1"
                    required
                  />
                  <Input
                    placeholder="Nº"
                    value={houseNumber}
                    onChange={e => {
                      setHouseNumber(e.target.value);
                      setFormData(prev => ({ ...prev, address: streetSearch ? `${streetSearch}, ${e.target.value}` : prev.address }));
                    }}
                    className="w-20"
                  />
                </div>
                {streetSugs.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {streetSugs.map((s, i) => (
                      <div key={i} onClick={() => selectStreet(s)} className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-slate-800 truncate">{s.logradouro}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">
                          {s.bairro && <span>{s.bairro} · </span>}
                          CEP {s.cep}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAP — always visible once city is selected, auto-centers on pin */}
              {formData.cityId && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirmação no Mapa <span className="font-normal text-slate-400">(toque para ajustar o pino)</span></p>
                  <div className="w-full h-52 rounded-lg overflow-hidden border border-slate-300 shadow-inner relative">
                    <MapContainer
                      center={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [-16.4672, -54.6383]}
                      zoom={formData.latitude ? 16 : 13}
                      className="w-full h-full z-0"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker />
                    </MapContainer>
                  </div>
                </div>
              )}
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
