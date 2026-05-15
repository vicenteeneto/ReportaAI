import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { User, Save, Upload, MapPin, Phone, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CitizenProfile() {
  const { currentUser, tickets: appTickets } = useAppContext();
  
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(formatPhone(currentUser?.phone || ''));
  const [cpf, setCpf] = useState(formatCPF(currentUser?.cpf || ''));
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar-${currentUser.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      }

      const updates = {
        name,
        phone,
        cpf,
        neighborhood,
        avatarurl: finalAvatarUrl,
        departmentid: currentUser.departmentId || currentUser.departmentid
      };
      
      const { error } = await supabase.from('users').update(updates).eq('id', currentUser.id);
      
      if (error) throw error;
      
      alert('Perfil atualizado com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Error updating profile', error);
      alert('Erro ao atualizar o perfil. Detalhes: ' + (error.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 font-sans animate-fade-in">
      <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
        <User className="w-5 h-5 text-[#1E3A8A]" />
        Meu Perfil
      </h2>
      
      <Card className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-2 border-4 border-white shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1E3A8A] text-white text-3xl font-bold uppercase">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-0 bg-white border border-slate-200 rounded-full p-1.5 shadow-md cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarUrl(URL.createObjectURL(file));
                  }
                }}
              />
              <Upload className="w-3.5 h-3.5 text-[#1E3A8A]" />
            </label>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Foto de Perfil</p>
        </div>

        <div className="space-y-4">
          <Input 
            label="Nome Completo *" 
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
          />
          <Input 
            label="E-mail" 
            value={currentUser?.email || ''}
            disabled
          />
          <Input 
            label="Telefone com DDD" 
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={handlePhoneChange}
            icon={Phone}
          />
          <Input 
            label="CPF" 
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            icon={Hash}
          />
          <Input 
            label="Seu Bairro" 
            placeholder="Digite o nome do bairro"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            icon={MapPin}
          />
        </div>

        <div className="mt-8">
          <Button 
            className="w-full font-bold uppercase tracking-widest h-12"
            onClick={handleSave}
            disabled={isSaving}
            icon={Save}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
