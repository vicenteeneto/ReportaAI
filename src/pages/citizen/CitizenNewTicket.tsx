import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { Camera, MapPin, CheckCircle2, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';

// Utility for generating UUID if crypto.randomUUID is unavailable
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Ignorar e usar fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple image resize/compress to improve mobile upload performance
// Using browser-image-compression for robust memory handling and worker support
async function compressImage(file: File): Promise<Blob> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };
  
  try {
    const compressedBlob = await imageCompression(file, options);
    return compressedBlob;
  } catch (error) {
    console.warn('Image compression with web worker failed, trying fallback...', error);
    try {
      options.useWebWorker = false;
      return await imageCompression(file, options);
    } catch (fallbackErr) {
      console.error('All compression attempts failed', fallbackErr);
      throw fallbackErr;
    }
  }
}

export function CitizenNewTicket() {
  const navigate = useNavigate();
  const { categories, currentUser, addTicket } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newProtocol, setNewProtocol] = useState('');
  const [isLocating, setIsLocating] = useState(false);

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

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Cleanup object URLs to prevent memory leaks (critical for mobile)
  useEffect(() => {
    return () => {
      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoUrl);
      }
    };
  }, [formData.photoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Por favor, selecione uma categoria.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let uploadedPhotoUrl: string | undefined = undefined;

      // Ensure we have a user
      const userId = currentUser?.id;
      if (!userId) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

      if (photoFile) {
        try {
          // Wrap compression in a timeout so it doesn't hang the app forever
          const compressTimeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout na conversão da imagem (Muito grande ou erro de memória)")), 25000)
          );
          
          const compressedBlob: Blob = await Promise.race([
            compressImage(photoFile),
            compressTimeoutPromise
          ]);
          
          const fileName = `${Date.now()}-${userId}.jpg`;
          
          const uploadPromise = supabase.storage
            .from('tickets')
            .upload(fileName, compressedBlob, {
              contentType: 'image/jpeg',
              upsert: false
            });
            
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout no upload da imagem (conexão lenta)")), 25000)
          );

          const { data, error }: any = await Promise.race([uploadPromise, timeoutPromise]);
            
          if (!error && data) {
             const { data: { publicUrl } } = supabase.storage.from('tickets').getPublicUrl(fileName);
             uploadedPhotoUrl = publicUrl;
          } else if (error) {
             console.error('Storage upload error:', error);
             // We continue without the photo rather than blocking the whole ticket
          }
        } catch (storageErr) {
          console.warn("Falha no processamento/upload da foto:", storageErr);
          // Non-blocking error
        }
      }

      // Sequential Protocol Logic
      let nextNum = Math.floor(Math.random() * 900000) + 100000;
      try {
        const { count, error } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).limit(1);
        if (!error && count !== null) {
          nextNum = count + 1;
        }
      } catch (e) {
        console.warn("Protocol fallback used");
      }
      
      const generatedProtocol = `RD-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;
      
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
      let errMsg = "Erro ao salvar chamado.";
      if (err.message) errMsg = err.message;
      alert("Atenção: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          setFormData({
            ...formData, 
            latitude: lat,
            longitude: lng,
            address: formData.address || addressLocal || `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            neighborhood: formData.neighborhood || neighborhoodLocal
          });
        } catch (e) {
          console.error("Reverse geocoding failed", e);
          setFormData({
            ...formData, 
            latitude: lat,
            longitude: lng,
            address: `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.photoUrl);
      }
      setPhotoFile(file);
      setFormData({...formData, photoUrl: URL.createObjectURL(file)});
    }
  };

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
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
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
                  <button 
                    type="button" 
                    onClick={() => {
                      if (formData.photoUrl && formData.photoUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(formData.photoUrl);
                      }
                      setPhotoFile(null);
                      setFormData({...formData, photoUrl: undefined});
                    }}
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

