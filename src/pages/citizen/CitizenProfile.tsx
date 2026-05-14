import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { User, Save, Upload, MapPin, Phone, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CitizenProfile() {
  const { currentUser } = useAppContext();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [cpf, setCpf] = useState(currentUser?.cpf || '');
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updates = {
        name,
        phone,
        cpf,
        neighborhood,
        avatarUrl,
      };
      
      const { error } = await supabase.from('users').update(updates).eq('id', currentUser.id);
      
      if (error) throw error;
      
      alert('Perfil atualizado com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Erro ao atualizar o perfil.');
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
          <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-4 border-4 border-white shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1E3A8A] text-white text-3xl font-bold uppercase">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="w-full">
            <Input 
              label="URL da Foto (opcional)" 
              placeholder="https://suafoto.com/imagem.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              icon={Upload}
              className="mb-2"
            />
          </div>
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
            onChange={(e) => setPhone(e.target.value)}
            icon={Phone}
          />
          <Input 
            label="CPF" 
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
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
