import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Users, Plus, Pencil, Trash2, Key, CheckCircle2, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { City, User, Department, Category } from '../../data/types';

export function PlatformManagement() {
  const [activeTab, setActiveTab] = useState<'cities' | 'users' | 'departments' | 'categories'>('cities');
  
  // Data State
  const [cities, setCities] = useState<City[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State - Cities
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [newCityForm, setNewCityForm] = useState({ name: '', state: '', logoUrl: '' });

  // Form State - Users
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'admin', cityId: '', password: '' });

  // Form State - Departments
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptForm, setNewDeptForm] = useState({ name: '', acronym: '', cityId: '', color: '#3b82f6' });

  // Form State - Categories
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: '', iconName: 'AlertTriangle', color: 'bg-blue-500', defaultDepartmentId: '', cityId: '', defaultPriority: 'medium' as any });

  // Loading Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: citiesData, error: citiesErr } = await supabase.from('cities').select('*').order('name');
      if (citiesErr) throw citiesErr;
      if (citiesData) setCities(citiesData);

      const { data: usersData, error: usersErr } = await supabase.from('users').select('*').in('role', ['admin', 'mayor', 'secretary', 'superadmin']).order('name');
      if (usersErr) throw usersErr;
      if (usersData) setAdminUsers(usersData);

      const { data: deptData, error: deptErr } = await supabase.from('departments').select('*').order('name');
      if (deptErr) throw deptErr;
      if (deptData) setDepartments(deptData.map(d => ({ ...d, cityId: d.cityId || d.city_id || d.cityid })));

      const { data: catData, error: catErr } = await supabase.from('categories').select('*').order('name');
      if (catErr) throw catErr;
      if (catData) setCategories(catData.map(c => ({
        ...c,
        defaultDepartmentId: c.defaultDepartmentId || c.default_department_id || c.defaultdepartmentid,
        cityId: c.cityId || c.city_id || c.cityid
      })));
    } catch (e) {
      console.error('Error loading platform data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('cities').insert([
        { 
          name: newCityForm.name, 
          state: newCityForm.state, 
          logoUrl: newCityForm.logoUrl,
          createdAt: Date.now() 
        }
      ]);
      if (error) throw error;
      
      setIsCityModalOpen(false);
      setNewCityForm({ name: '', state: '', logoUrl: '' });
      loadData();
      alert('Cidade cadastrada com sucesso!');
    } catch (e: any) {
      alert(`Erro ao criar cidade: ${e.message}`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create auth user (this requires proper privileges or an API endpoint, but we'll try direct client if allowed)
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
      });

      if (authErr && !authErr.message.includes('already registered')) throw authErr;

      // 2. Insert into users table
      const userId = authData.user?.id || 'id-pendente-' + Date.now(); // fallback if already registered but we don't have id
      
      const { error: dbErr } = await supabase.from('users').upsert({
        id: userId,
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        cityId: newUserForm.cityId || null, // null for superadmin
        createdAt: Date.now()
      });

      if (dbErr) throw dbErr;

      setIsUserModalOpen(false);
      setNewUserForm({ name: '', email: '', role: 'admin', cityId: '', password: '' });
      loadData();
      alert('Usuário gestor criado com sucesso!');
    } catch (e: any) {
      alert(`Erro ao criar usuário: ${e.message}`);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('departments').insert([
        {
          id: 'dep-' + Date.now(),
          name: newDeptForm.name,
          acronym: newDeptForm.acronym,
          color: newDeptForm.color,
          cityId: newDeptForm.cityId,
          active: true
        }
      ]);
      if (error) throw error;
      
      setIsDeptModalOpen(false);
      setNewDeptForm({ name: '', acronym: '', cityId: '', color: '#3b82f6' });
      loadData();
      alert('Secretaria cadastrada com sucesso!');
    } catch (e: any) {
      alert(`Erro ao criar secretaria: ${e.message}`);
    }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('categories').insert([
        {
          id: 'cat-' + Date.now(),
          name: newCatForm.name,
          icon_name: newCatForm.iconName,
          color: newCatForm.color,
          default_department_id: newCatForm.defaultDepartmentId,
          default_priority: newCatForm.defaultPriority,
          cityId: newCatForm.cityId
        }
      ]);
      if (error) throw error;
      
      setIsCatModalOpen(false);
      setNewCatForm({ name: '', iconName: 'AlertTriangle', color: 'bg-blue-500', defaultDepartmentId: '', cityId: '', defaultPriority: 'medium' as any });
      loadData();
      alert('Categoria cadastrada com sucesso!');
    } catch (e: any) {
      alert(`Erro ao criar categoria: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-[#1E3A8A]" /> Gestão da Plataforma (SaaS)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Administração de Múltiplas Prefeituras e Acessos Master</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('cities')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'cities' 
              ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" /> Cidades Clientes
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'users' 
              ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Gestores / Prefeitos
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'departments' 
              ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" /> Secretarias
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'categories' 
              ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" /> Categorias
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'cities' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsCityModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Nova Cidade
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map(city => (
                  <Card key={city.id} className="relative overflow-hidden group">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{city.name}</h3>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">{city.state}</span>
                        </div>
                        {city.isActive && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">ID: {city.id.split('-')[0]}...</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Modal Nova Cidade */}
              {isCityModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md bg-white">
                    <CardHeader>
                      <CardTitle>Cadastrar Nova Prefeitura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateCity} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Nome da Cidade</label>
                          <Input required value={newCityForm.name} onChange={e => setNewCityForm({...newCityForm, name: e.target.value})} placeholder="Ex: Cuiabá" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Estado (UF)</label>
                          <Input required value={newCityForm.state} onChange={e => setNewCityForm({...newCityForm, state: e.target.value})} placeholder="Ex: MT" maxLength={2} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">URL do Brasão (Opcional)</label>
                          <Input value={newCityForm.logoUrl} onChange={e => setNewCityForm({...newCityForm, logoUrl: e.target.value})} placeholder="https://..." />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCityModalOpen(false)}>Cancelar</Button>
                          <Button type="submit" className="flex-1">Salvar Cidade</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Novo Gestor
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Nome / Email</th>
                        <th className="px-4 py-3">Papel</th>
                        <th className="px-4 py-3">Cidade Vinculada</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {adminUsers.map(user => {
                        const city = cities.find(c => c.id === user.cityId);
                        return (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'mayor' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {user.role === 'superadmin' ? (
                                <span className="text-xs text-purple-600 font-bold">Acesso Global</span>
                              ) : city ? (
                                <span className="text-xs font-medium text-slate-700">{city.name} - {city.state}</span>
                              ) : (
                                <span className="text-xs text-red-500 font-bold">Sem Vínculo</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Novo Usuário */}
              {isUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md bg-white">
                    <CardHeader>
                      <CardTitle>Cadastrar Gestor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Nome</label>
                          <Input required value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Email Login</label>
                          <Input type="email" required value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Senha Padrão</label>
                          <Input type="text" required value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} placeholder="Min. 6 caracteres" minLength={6} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Nível de Acesso</label>
                            <select 
                              className="w-full h-10 px-3 py-2 text-sm border rounded-md"
                              value={newUserForm.role}
                              onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}
                            >
                              <option value="admin">Administrador Base</option>
                              <option value="mayor">Prefeito(a)</option>
                              <option value="superadmin">Dono (Superadmin)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Prefeitura Vinculada</label>
                            <select 
                              className="w-full h-10 px-3 py-2 text-sm border rounded-md"
                              value={newUserForm.cityId}
                              onChange={e => setNewUserForm({...newUserForm, cityId: e.target.value})}
                              disabled={newUserForm.role === 'superadmin'}
                              required={newUserForm.role !== 'superadmin'}
                            >
                              <option value="">Selecione...</option>
                              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUserModalOpen(false)}>Cancelar</Button>
                          <Button type="submit" className="flex-1">Criar Gestor</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsDeptModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Nova Secretaria
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Sigla</th>
                      <th className="px-4 py-3">Nome da Secretaria</th>
                      <th className="px-4 py-3">Cidade Vinculada</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departments.map(dep => {
                      const city = cities.find(c => c.id === dep.cityId);
                      return (
                        <tr key={dep.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-700">{dep.acronym}</td>
                          <td className="px-4 py-3 text-slate-600 font-medium">{dep.name}</td>
                          <td className="px-4 py-3">
                            {city ? <span className="text-xs font-medium text-slate-700">{city.name}</span> : <span className="text-xs text-slate-400">Padrão do Sistema</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isDeptModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md bg-white">
                    <CardHeader>
                      <CardTitle>Cadastrar Nova Secretaria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateDept} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Sigla</label>
                          <Input required value={newDeptForm.acronym} onChange={e => setNewDeptForm({...newDeptForm, acronym: e.target.value})} placeholder="Ex: SINFRA" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Nome Completo</label>
                          <Input required value={newDeptForm.name} onChange={e => setNewDeptForm({...newDeptForm, name: e.target.value})} placeholder="Ex: Secretaria Mun. de Infraestrutura" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Cidade Vinculada</label>
                          <select 
                            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white"
                            value={newDeptForm.cityId}
                            onChange={e => setNewDeptForm({...newDeptForm, cityId: e.target.value})}
                            required
                          >
                            <option value="">Selecione a cidade...</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDeptModalOpen(false)}>Cancelar</Button>
                          <Button type="submit" className="flex-1">Salvar</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Nova Categoria
                </Button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Cor / Ícone</th>
                      <th className="px-4 py-3">Nome da Categoria</th>
                      <th className="px-4 py-3">Sec. Padrão</th>
                      <th className="px-4 py-3">Cidade Vinculada</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map(cat => {
                      const dep = departments.find(d => d.id === cat.defaultDepartmentId);
                      const city = cities.find(c => c.id === cat.cityId);
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className={`w-6 h-6 rounded-md ${cat.color.replace('bg-', 'bg-')} shadow-sm border border-black/10`}></div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold">{cat.name}</td>
                          <td className="px-4 py-3 text-slate-500 font-medium text-xs">{dep?.acronym || dep?.name || 'Não definida'}</td>
                          <td className="px-4 py-3">
                            {city ? <span className="text-xs font-medium text-slate-700">{city.name}</span> : <span className="text-xs text-slate-400">Padrão</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">Editar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isCatModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md bg-white overflow-y-auto max-h-[90vh]">
                    <CardHeader>
                      <CardTitle>Cadastrar Categoria de Problema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateCat} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Nome do Problema</label>
                          <Input required value={newCatForm.name} onChange={e => setNewCatForm({...newCatForm, name: e.target.value})} placeholder="Ex: Buraco na rua" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Cor de Identificação (Tailwind)</label>
                          <select 
                            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white"
                            value={newCatForm.color}
                            onChange={e => setNewCatForm({...newCatForm, color: e.target.value})}
                          >
                            <option value="bg-blue-500">Azul</option>
                            <option value="bg-red-500">Vermelho</option>
                            <option value="bg-yellow-500">Amarelo</option>
                            <option value="bg-green-500">Verde</option>
                            <option value="bg-orange-500">Laranja</option>
                            <option value="bg-purple-500">Roxo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Cidade Vinculada</label>
                          <select 
                            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white"
                            value={newCatForm.cityId}
                            onChange={e => {
                              setNewCatForm({...newCatForm, cityId: e.target.value, defaultDepartmentId: ''});
                            }}
                            required
                          >
                            <option value="">Selecione a cidade...</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Secretaria Padrão</label>
                          <select 
                            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-white"
                            value={newCatForm.defaultDepartmentId}
                            onChange={e => setNewCatForm({...newCatForm, defaultDepartmentId: e.target.value})}
                            required={!!newCatForm.cityId}
                            disabled={!newCatForm.cityId}
                          >
                            <option value="">Selecione a secretaria resolutiva...</option>
                            {departments.filter(d => d.cityId === newCatForm.cityId).map(d => (
                              <option key={d.id} value={d.id}>{d.acronym} - {d.name}</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-400">Primeiro selecione a cidade para ver as secretarias disponíveis.</p>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCatModalOpen(false)}>Cancelar</Button>
                          <Button type="submit" className="flex-1">Salvar Categoria</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
