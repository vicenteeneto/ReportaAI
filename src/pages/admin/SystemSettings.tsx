import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Department } from '../../data/types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export function SystemSettings() {
  const { currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New User Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [newDepartment, setNewDepartment] = useState('');
  const [newCity, setNewCity] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, depsRes, citiesRes] = await Promise.all([
      supabase.from('users').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('cities').select('*').order('name')
    ]);
    if (usersRes.data) setUsers(usersRes.data);
    if (depsRes.data) setDepartments(depsRes.data);
    if (citiesRes.data) setCities(citiesRes.data);
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    }
  };

  const handleUpdateDepartment = async (userId: string, departmentId: string) => {
    console.log('Update department called:', userId, departmentId);
    const val = departmentId === '' ? null : departmentId;
    const { error } = await supabase.from('users').update({ departmentId: val } as any).eq('id', userId);
    console.log('Update department error:', error);
    if (!error) {
       setUsers(users.map(u => u.id === userId ? { ...u, departmentId: val } as any : u));
    } else {
       alert('Erro ao atualizar departamento: ' + error.message);
    }
  };

  const handleUpdateCity = async (userId: string, cityId: string) => {
    console.log('Update city called:', userId, cityId);
    const val = cityId === '' ? null : cityId;
    const { error } = await supabase.from('users').update({ cityId: val } as any).eq('id', userId);
    console.log('Update city error:', error);
    if (!error) {
       setUsers(users.map(u => u.id === userId ? { ...u, cityId: val } as any : u));
    } else {
      alert('Erro ao atualizar cidade: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja apagar este usuário do sistema? O registro do auth base ainda existirá.')) return;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert('Erro ao apagar. Pode haver dependências.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail || !newPassword) return;
    
    setIsCreating(true);
    try {
      const existingUser = users.find(u => u.email?.toLowerCase() === normalizedEmail);
      if (existingUser) {
        throw new Error('Este e-mail já existe na lista de usuários do sistema.');
      }

      const { data: sessionBefore } = await supabase.auth.getSession();
      const res = await supabase.auth.signUp({
        email: normalizedEmail,
        password: newPassword,
      });

      if (res.error) throw res.error;
      if (!res.data.user) {
        throw new Error('O Supabase não retornou o usuário criado.');
      }
      if (res.data.user.identities && res.data.user.identities.length === 0) {
        throw new Error('Este e-mail já está cadastrado na autenticação do Supabase.');
      }
      
      const newUserPayload = {
        id: res.data.user.id,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: newRole,
        departmentId: newDepartment || null,
        cityId: newCity || null
      };

      const { error: profileError } = await supabase.from('users').upsert(newUserPayload);
      if (profileError) throw profileError;

      const { data: sessionAfter } = await supabase.auth.getSession();
      const sessionChanged = !!sessionAfter.session?.user?.id && sessionAfter.session.user.id !== sessionBefore.session?.user?.id;

      setNewEmail('');
      setNewPassword('');
      setNewDepartment('');
      setNewCity('');
      await fetchData();

      if (sessionChanged && sessionAfter.session?.user?.id !== currentUser?.id) {
        alert('Usuário criado, mas a sessão foi alternada pelo Supabase. Faça login novamente com sua conta de administrador.');
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        return;
      }

      alert('Usuário criado com sucesso.');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar usuário: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  if (loading) return <div className="p-8">Carregando painel de super administração...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configurações do Sistema</h2>
          <p className="text-sm text-slate-500">Gestão global de prefeituras (secretarias) e usuários - KNG Flow</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestão de Usuários e Delegação</CardTitle>
              <div className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-medium">
                {users.length} usuários
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Nome / E-mail</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Função</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Secretaria</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Cidade</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">{user.name || 'Sem nome'}</div>
                          <div className="text-slate-500 text-xs truncate max-w-[200px]" title={user.email}>{user.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            className="border border-slate-200 rounded p-1 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          >
                            <option value="citizen">Cidadão</option>
                            <option value="field">Agente de Campo</option>
                            <option value="triage">Triagem (Atendente)</option>
                            <option value="coordinator">Coordenador</option>
                            <option value="secretary">Secretário</option>
                            <option value="admin">Administrador (Geral)</option>
                            <option value="mayor">Prefeito</option>
                            <option value="superadmin">Super Admin (KNG Flow)</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            className="border border-slate-200 rounded p-1 text-sm bg-white max-w-[150px] hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                            value={user.departmentId || ''}
                            onChange={(e) => handleUpdateDepartment(user.id, e.target.value)}
                          >
                            <option value="">-- Todas --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <select 
                            className="border border-slate-200 rounded p-1 text-sm bg-white max-w-[150px] hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                            value={user.cityId || ''}
                            onChange={(e) => handleUpdateCity(user.id, e.target.value)}
                          >
                            <option value="">-- Todas --</option>
                            {cities.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {user.email !== 'contato@kngflow.com' && (
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider py-1 px-2 rounded hover:bg-red-50 transition-colors"
                            >
                              Apagar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[#1E3A8A]/20 shadow-md">
            <CardHeader className="bg-[#1E3A8A]/5 border-b border-[#1E3A8A]/10">
              <CardTitle className="text-[#1E3A8A]">Criar Novo Usuário</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail</label>
                  <Input 
                    required 
                    type="email" 
                    placeholder="email@prefeitura.gov.br" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha Provisória</label>
                  <Input 
                    required 
                    type="text" 
                    placeholder="Min 6 caracteres" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Função / Perfil</label>
                  <select 
                    className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="admin">Administrador (Geral)</option>
                    <option value="secretary">Secretário</option>
                    <option value="coordinator">Coordenador</option>
                    <option value="triage">Triagem (Atendente)</option>
                    <option value="field">Agente de Campo</option>
                    <option value="mayor">Prefeito</option>
                    <option value="citizen">Cidadão</option>
                    <option value="superadmin">Super Admin (KNG Flow)</option>
                  </select>
                </div>
                {(newRole === 'secretary' || newRole === 'coordinator' || newRole === 'field') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vincular Secretaria</label>
                    <select 
                      className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                    >
                      <option value="">-- Todas --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.acronym})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vincular Cidade</label>
                  <select 
                    className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  >
                    <option value="">-- Todas --</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <Button type="submit" isLoading={isCreating} className="w-full bg-[#1E3A8A] hover:bg-blue-800 font-bold uppercase tracking-wide text-sm mt-2">
                  Cadastrar Usuário
                </Button>
                <p className="text-[10px] text-slate-500 text-center leading-tight">
                  Se o e-mail já existir no Supabase Auth, o cadastro será bloqueado para evitar falso sucesso.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cidades / Prefeituras (Tenants)</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                 O sistema opera integrando as Cidades. Para o Super Admin KNG Flow, as <strong className="text-slate-700">Cidades</strong> cadastradas são listadas abaixo e podem ser atribuídas aos usuários.
               </p>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                 {cities.map(c => (
                   <div key={c.id} className="p-3 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                     <div className="font-medium text-sm text-slate-800">{c.name} {c.state && <span className="opacity-50 ml-1 text-xs">({c.state})</span>}</div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
