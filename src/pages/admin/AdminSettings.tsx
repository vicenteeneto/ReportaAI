import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { Building2, Tag } from 'lucide-react';


export function AdminSettings() {
  const { categories, departments } = useAppContext();
  const [activeTab, setActiveTab] = useState<'departments' | 'categories'>('departments');

  // Structural changes are centralized in the Super Admin area until safe city-scoped mutations are available.
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Configurações do Sistema</h2>
          <p className="text-sm text-slate-500">Gerenciamento de Secretarias e Categorias de chamados.</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Secretarias e categorias estao em modo somente leitura nesta tela. Altere estruturas globais pelo Super Admin para evitar configuracoes incompletas por municipio.
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors ${activeTab === 'departments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 className="w-4 h-4" /> Secretarias
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Tag className="w-4 h-4" /> Categorias
        </button>
      </div>

      <div>
        {activeTab === 'departments' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg">Secretarias Cadastradas</CardTitle>
              <Button size="sm" variant="outline" disabled>Somente leitura</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Sigla</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map(dep => (
                    <tr key={dep.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">{dep.acronym}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{dep.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${dep.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {dep.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Super Admin</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'categories' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg">Categorias de Chamados</CardTitle>
              <Button size="sm" variant="outline" disabled>Somente leitura</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Cor/Ícone</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Secretaria Padrão</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map(cat => {
                    const dep = departments.find(d => d.id === cat.defaultDepartmentId);
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className={`w-6 h-6 rounded-md ${cat.color.replace('bg-', 'bg-') || 'bg-slate-200'} shadow-sm border border-black/10`}></div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-bold">{cat.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{dep?.name || 'Não definida'}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Super Admin</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
