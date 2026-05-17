import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { Camera, MapPin, CheckCircle2, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';

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

/** Wraps any promise with a hard timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} (${ms / 1000}s)`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

// ─── Photo Compression ──────────────────────────────────────────────────────
// Target: 800px max dimension, JPEG quality 0.75 → result is ~80-200KB.
// Two strategies for maximum Android compatibility:
//   1. createImageBitmap (Chrome/Android) — decodes OFF the main thread, fast
//   2. Image + Canvas fallback (Safari/iOS)

const PHOTO_MAX_PX = 800;
const PHOTO_QUALITY = 0.75;

/** Draws an ImageBitmap or HTMLImageElement to a canvas and exports as JPEG blob. */
function canvasExport(source: ImageBitmap | HTMLImageElement, w: number, h: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas indisponível')); return; }
    ctx.drawImage(source, 0, 0, w, h);
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('toBlob falhou')),
      'image/jpeg',
      PHOTO_QUALITY
    );
  });
}

/** Calculate target dimensions keeping aspect ratio. */
function targetSize(w: number, h: number): [number, number] {
  if (w <= PHOTO_MAX_PX && h <= PHOTO_MAX_PX) return [w, h];
  if (w > h) return [PHOTO_MAX_PX, Math.round((h / w) * PHOTO_MAX_PX)];
  return [Math.round((w / h) * PHOTO_MAX_PX), PHOTO_MAX_PX];
}

/**
 * Compress a photo file to a small JPEG blob.
 * Uses createImageBitmap when available (Android Chrome) for off-thread decoding.
 * Falls back to Image element (iOS Safari).
 */
async function compressPhoto(file: File): Promise<Blob> {
  // ── Strategy 1: createImageBitmap (Chrome 50+, ideal for Android) ──
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file);
      const [tw, th] = targetSize(bmp.width, bmp.height);

      // Try resize during decode (Chrome 54+) — most memory-efficient
      try {
        const resized = await createImageBitmap(file, { resizeWidth: tw, resizeHeight: th, resizeQuality: 'medium' } as any);
        bmp.close();
        const blob = await canvasExport(resized, tw, th);
        resized.close();
        return blob;
      } catch (_) {
        // resizeWidth/Height not supported (Safari) — draw full bitmap to small canvas
        const blob = await canvasExport(bmp, tw, th);
        bmp.close();
        return blob;
      }
    } catch (e) {
      console.warn('createImageBitmap falhou, usando fallback Image:', e);
    }
  }

  // ── Strategy 2: Image element fallback (Safari/older browsers) ──
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const [tw, th] = targetSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
        canvasExport(img, tw, th).then(resolve, reject);
      } catch (err) { reject(err); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem não suportada')); };
    img.src = url;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CitizenNewTicket() {
  const navigate = useNavigate();
  const { categories, currentUser, addTicket } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newProtocol, setNewProtocol] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    address: '',
    neighborhood: '',
    priority: 'medium' as any,
    photoUrl: undefined as string | undefined,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  // Photo state: compressed blob (ready for upload) + compression status
  const [compressedPhoto, setCompressedPhoto] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  // Ref to the in-flight compression promise so handleSubmit can await it
  const compressionPromiseRef = useRef<Promise<Blob> | null>(null);

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

    // Normalize MIME type (some Android cameras return empty type)
    const safeFile = (file.type && file.type.startsWith('image/'))
      ? file
      : new File([file], file.name || 'photo.jpg', { type: 'image/jpeg' });

    // Show instant preview from original file
    const previewUrl = URL.createObjectURL(safeFile);
    setFormData(prev => ({...prev, photoUrl: previewUrl}));
    setCompressedPhoto(null);
    setIsCompressing(true);

    // Start compression in background — runs while user fills out the form
    const promise = withTimeout(compressPhoto(safeFile), 25000, 'compressão da foto')
      .then((blob) => {
        setCompressedPhoto(blob);
        // Replace preview with the compressed version (saves memory)
        const compressedUrl = URL.createObjectURL(blob);
        URL.revokeObjectURL(previewUrl);
        setFormData(prev => ({...prev, photoUrl: compressedUrl}));
        return blob;
      })
      .catch((err) => {
        console.warn('Compressão da foto falhou:', err?.message || err);
        setCompressedPhoto(null);
        throw err;
      })
      .finally(() => {
        setIsCompressing(false);
        compressionPromiseRef.current = null;
      });

    compressionPromiseRef.current = promise;
  };

  // ─── Remove photo ───
  const handleRemovePhoto = () => {
    if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.photoUrl);
    }
    setCompressedPhoto(null);
    setIsCompressing(false);
    compressionPromiseRef.current = null;
    setFormData(prev => ({...prev, photoUrl: undefined}));
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.categoryId) { setErrorMsg('Por favor, selecione uma categoria.'); return; }

    setIsSubmitting(true);
    
    try {
      const userId = currentUser?.id;
      if (!userId) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

      let uploadedPhotoUrl: string | undefined = undefined;

      // ── Photo upload (photo is already compressed — just upload the small blob) ──
      let photoBlob = compressedPhoto;

      // If compression is still running, wait up to 8s for it
      if (!photoBlob && compressionPromiseRef.current) {
        try {
          photoBlob = await withTimeout(compressionPromiseRef.current, 8000, 'aguardando compressão');
        } catch (_) {
          console.warn('Compressão não terminou a tempo, enviando sem foto');
        }
      }

      if (photoBlob) {
        try {
          const fileName = `${Date.now()}-${userId}.jpg`;
          const { data, error }: any = await withTimeout(
            supabase.storage.from('tickets').upload(fileName, photoBlob, {
              contentType: 'image/jpeg',
              upsert: false
            }),
            15000,
            'upload da foto'
          );
          if (!error && data) {
            const { data: { publicUrl } } = supabase.storage.from('tickets').getPublicUrl(fileName);
            uploadedPhotoUrl = publicUrl;
          } else if (error) {
            console.warn('Upload falhou:', error?.message || error);
          }
        } catch (uploadErr: any) {
          console.warn('Upload ignorado:', uploadErr?.message || uploadErr);
        }
      }

      // ── Protocol number ──
      // Usamos fetch nativo para evitar o travamento do cliente Supabase no Android.
      let nextNum = Math.floor(Math.random() * 900000) + 100000; // Fallback caso dê erro de rede
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
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
        priority: formData.priority,
        status: 'received',
        latitude: formData.latitude || -16.4716 + (Math.random() * 0.01 - 0.005),
        longitude: formData.longitude || -54.6369 + (Math.random() * 0.01 - 0.005),
        photoUrl: uploadedPhotoUrl,
        createdAt: Date.now()
      };

      await addTicket(newTicket);
      setNewProtocol(generatedProtocol);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error creating ticket", err);
      const msg = err?.message || 'Erro ao salvar chamado.';
      setErrorMsg(msg);
      // Also alert as backup (works on iOS; may be suppressed on Android PWA)
      try { alert('Atenção: ' + msg); } catch (_) {}
    } finally {
      setIsSubmitting(false);
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

          if (data && data.address) {
             const road = data.address.road || '';
             const houseNumber = data.address.house_number || '';
             const suburb = data.address.suburb || data.address.neighbourhood || '';
             
             if (road) {
               addressLocal = houseNumber ? `${road}, ${houseNumber}` : road;
             }
             if (suburb) {
               neighborhoodLocal = suburb;
             }
          }

          setFormData(prev => ({
            ...prev, 
            latitude: lat,
            longitude: lng,
            address: prev.address || addressLocal || `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            neighborhood: prev.neighborhood || neighborhoodLocal
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
        <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Etapa {step} de 2</span>
      </div>

      <div className="w-full bg-slate-200 h-1 mb-8">
        <div className="bg-[#1E3A8A] h-1 transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }}></div>
      </div>

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>

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

        {step === 1 && (
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
                <div className="relative h-48 rounded overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-contain" />
                  {/* Compression overlay indicator */}
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Processando foto...</span>
                    </div>
                  )}
                  <button 
                    type="button" 
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Endereço do Local</label>
              <div className="flex gap-2 relative">
                <Input 
                  placeholder="Local da ocorrência" 
                  className="flex-1"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3 border-slate-300 bg-white min-w-[50px]" 
                  title="Localizar via GPS"
                  disabled={isLocating}
                  onClick={handleGetLocation}
                >
                  {isLocating ? <Loader2 className="w-5 h-5 text-[#1E3A8A] animate-spin" /> : <MapPin className="w-5 h-5 text-[#1E3A8A]" />}
                </Button>
              </div>
            </div>
             <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Bairro</label>
              <Input 
                placeholder="Ex. Centro" 
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full mt-6 h-12 font-bold uppercase tracking-wide text-xs">Avançar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-8">
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Urgência</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-3 rounded border text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm ${
                      formData.priority === p 
                        ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-blue-200' 
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Crítica'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" disabled={isSubmitting} variant="outline" className="flex-1 font-bold uppercase tracking-wide text-[10px] h-12" onClick={() => setStep(1)}>Voltar</Button>
              <Button type="submit" className="flex-[2] font-bold uppercase tracking-wide text-[10px] h-12" isLoading={isSubmitting}>Confirmar Solicitação</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
