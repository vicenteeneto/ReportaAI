import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { Camera, MapPin, CheckCircle2, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Por favor, selecione uma categoria.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let uploadedPhotoUrl = formData.photoUrl;

      // Ensure we have a user
      const userId = currentUser?.id;
      if (!userId) throw new Error("Usuário não autenticado. Por favor, faça login novamente.");

      if (photoFile) {
        try {
          const fileExtension = photoFile.name.split('.').pop();
          const fileName = `${Date.now()}-${userId}.${fileExtension}`;
          
          // Timeout para upload de 15 segundos para não travar o mobile
          const uploadPromise = supabase.storage
            .from('tickets')
            .upload(fileName, photoFile);
            
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout no upload da imagem")), 15000)
          );

          const { data, error }: any = await Promise.race([uploadPromise, timeoutPromise]);
            
          if (!error && data) {
             const { data: { publicUrl } } = supabase.storage.from('tickets').getPublicUrl(fileName);
             uploadedPhotoUrl = publicUrl;
          } else {
             console.warn('Storage upload error:', error);
          }
        } catch (storageErr) {
          console.warn("Falha no upload, continuando sem foto:", storageErr);
        }
      }

      // Sequential Protocol Logic melhorado
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
        id: crypto.randomUUID(),
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
      // Extraindo mensagem amigável caso seja JSON
      let errMsg = "Erro técnico no servidor.";
      if (err.message) errMsg = err.message;
      else if (typeof err === 'string') errMsg = err;
      
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
          // Usando Nominatim (OpenStreetMap) para converter coordenadas em endereço
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
        alert('Não foi possível acessar a localização. Verifique as permissões do navegador.');
      },
      { timeout: 10000 }
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

      {/* Progress Line */}
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
                  <label className="border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        setFormData({...formData, photoUrl: URL.createObjectURL(file)});
                      }
                    }} />
                    <Camera className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500">Abrir Câmera</span>
                  </label>
                  
                  <label className="border border-dashed border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 flex flex-col items-center justify-center relative overflow-hidden group">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        setFormData({...formData, photoUrl: URL.createObjectURL(file)});
                      }
                    }} />
                    <Upload className="w-5 h-5 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors text-slate-500">Galeria / Fotos</span>
                  </label>
                </div>
              ) : (
                <div className="relative h-40 rounded overflow-hidden border border-slate-200">
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhotoFile(null);
                      setFormData({...formData, photoUrl: undefined});
                    }}
                    className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors backdrop-blur-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Endereço do Local</label>
              <div className="flex gap-2 relative">
                <Input 
                  placeholder="Logradouro e número" 
                  className="flex-1"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3 border-slate-300 bg-white" 
                  title="Localizar via Satélite"
                  disabled={isLocating}
                  onClick={handleGetLocation}
                >
                  {isLocating ? <Loader2 className="w-5 h-5 text-[#1E3A8A] animate-spin" /> : <MapPin className="w-5 h-5 text-[#1E3A8A]" />}
                </Button>
              </div>
            </div>
             <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Região Administrativa (Bairro)</label>
              <Input 
                placeholder="Ex. Centro" 
                required
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full mt-6 h-12 font-bold uppercase tracking-wide text-xs">Continuar Informações</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Resumo do Problema</label>
              <Input 
                placeholder="Ex: Luminária queimada e quebrada" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Detalhamento para a Equipe</label>
              <Textarea 
                placeholder="Informações adicionais relevantes..." 
                className="h-28"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <p className="text-[9px] text-slate-500 font-medium">Os dados informados alimentam o sistema central de triagem da prefeitura.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Avaliação de Risco / Urgência</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-2 rounded border text-[10px] uppercase tracking-wider font-bold transition-colors ${
                      formData.priority === p 
                        ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white' 
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {p === 'low' ? 'Baixo' : p === 'medium' ? 'Médio' : 'Crítico'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" disabled={isSubmitting} variant="outline" className="flex-1 font-bold uppercase tracking-wide text-xs" onClick={() => setStep(1)}>Voltar</Button>
              <Button type="submit" className="flex-[2] font-bold uppercase tracking-wide text-xs" isLoading={isSubmitting}>Confirmar Solicitação</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

