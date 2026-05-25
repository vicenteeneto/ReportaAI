import { Category } from './types';

export const CATEGORY_OPTIONS: Category[] = [
  { id: 'cat-buraco', name: 'Buraco ou problema na via', iconName: 'AlertTriangle', color: 'bg-orange-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'high' },
  { id: 'cat-iluminacao', name: 'Iluminação pública', iconName: 'Lightbulb', color: 'bg-yellow-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-lixo', name: 'Lixo, entulho ou limpeza urbana', iconName: 'Trash2', color: 'bg-amber-700', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-mato', name: 'Mato alto ou terreno abandonado', iconName: 'Leaf', color: 'bg-green-500', defaultDepartmentId: 'dep-meio', defaultPriority: 'low' },
  { id: 'cat-bueiro-esgoto', name: 'Bueiro, esgoto ou alagamento', iconName: 'Waves', color: 'bg-blue-600', defaultDepartmentId: 'dep-infra', defaultPriority: 'high' },
  { id: 'cat-transito', name: 'Trânsito, semáforo ou sinalização', iconName: 'TrafficCone', color: 'bg-purple-500', defaultDepartmentId: 'dep-mobilidade', defaultPriority: 'medium' },
  { id: 'cat-calcada-acessibilidade', name: 'Calçada ou acessibilidade', iconName: 'Accessibility', color: 'bg-indigo-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-praca-parque', name: 'Praça, parque ou espaço público', iconName: 'Trees', color: 'bg-emerald-500', defaultDepartmentId: 'dep-meio', defaultPriority: 'medium' },
  { id: 'cat-arvore', name: 'Árvore ou risco ambiental', iconName: 'TreePine', color: 'bg-emerald-700', defaultDepartmentId: 'dep-meio', defaultPriority: 'high' },
  { id: 'cat-animal', name: 'Animal solto, ferido ou abandonado', iconName: 'PawPrint', color: 'bg-amber-500', defaultDepartmentId: 'dep-meio', defaultPriority: 'medium' },
  { id: 'cat-saude', name: 'Foco de dengue ou risco à saúde', iconName: 'Stethoscope', color: 'bg-red-500', defaultDepartmentId: 'dep-saude', defaultPriority: 'high' },
  { id: 'cat-predio-publico', name: 'Escola, UBS ou prédio público', iconName: 'Building2', color: 'bg-sky-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-seguranca-fiscalizacao', name: 'Segurança, vandalismo ou fiscalização', iconName: 'ShieldAlert', color: 'bg-rose-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'high' },
  { id: 'cat-atendimento-publico', name: 'Reclamação sobre atendimento público', iconName: 'MessageSquareWarning', color: 'bg-slate-600', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-ouvidoria', name: 'Sugestão, elogio ou ouvidoria', iconName: 'MessagesSquare', color: 'bg-cyan-600', defaultDepartmentId: 'dep-infra', defaultPriority: 'low' },
  { id: 'cat-outros', name: 'Outro problema', iconName: 'MoreHorizontal', color: 'bg-slate-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'low' },
];

export const sortCategoriesByRequestedOrder = <T extends { id?: string; name?: string }>(categories: T[]): T[] => {
  const order = new Map(CATEGORY_OPTIONS.map((category, index) => [category.name, index]));
  const fallbackOrder = new Map(CATEGORY_OPTIONS.map((category, index) => [category.id, index]));

  return [...categories].sort((a, b) => {
    const aOrder = order.get(a.name || '') ?? fallbackOrder.get(a.id || '') ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(b.name || '') ?? fallbackOrder.get(b.id || '') ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || String(a.name || '').localeCompare(String(b.name || ''));
  });
};
