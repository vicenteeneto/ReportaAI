import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newCategories = [
  // Infraestrutura Urbana
  {
    id: 'cat-boca-lobo',
    name: 'Boca de Lobo Entupida/Sem Tampa',
    iconName: 'droplets',
    color: '#3b82f6',
    defaultDepartmentId: 'dep-infra',
    defaultPriority: 'high',
    createdAt: Date.now()
  },
  {
    id: 'cat-calcada',
    name: 'Calçada Danificada / Obstruída',
    iconName: 'map',
    color: '#94a3b8',
    defaultDepartmentId: 'dep-infra',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },
  {
    id: 'cat-ponto-onibus',
    name: 'Ponto de Ônibus Danificado',
    iconName: 'bus',
    color: '#64748b',
    defaultDepartmentId: 'dep-infra',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },

  // Meio Ambiente e Zeladoria
  {
    id: 'cat-terreno-baldio',
    name: 'Terreno Baldio com Mato Alto',
    iconName: 'scissors',
    color: '#22c55e',
    defaultDepartmentId: 'dep-meio',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },
  {
    id: 'cat-animal-morto',
    name: 'Animal Morto na Via Pública',
    iconName: 'skull',
    color: '#ef4444',
    defaultDepartmentId: 'dep-meio',
    defaultPriority: 'high',
    createdAt: Date.now()
  },
  {
    id: 'cat-esgoto',
    name: 'Descarte Irregular de Esgoto',
    iconName: 'droplet',
    color: '#14b8a6',
    defaultDepartmentId: 'dep-meio',
    defaultPriority: 'urgent',
    createdAt: Date.now()
  },

  // Transporte e Trânsito
  {
    id: 'cat-veiculo-abandonado',
    name: 'Veículo Abandonado na Via',
    iconName: 'car',
    color: '#64748b',
    defaultDepartmentId: 'dep-transito',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },
  {
    id: 'cat-placa-transito',
    name: 'Placa de Trânsito Caída / Danificada',
    iconName: 'alert-octagon',
    color: '#f59e0b',
    defaultDepartmentId: 'dep-transito',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },
  {
    id: 'cat-faixa-pedestre',
    name: 'Faixa de Pedestre Apagada',
    iconName: 'navigation',
    color: '#3b82f6',
    defaultDepartmentId: 'dep-transito',
    defaultPriority: 'low',
    createdAt: Date.now()
  },

  // Saúde e Vigilância Sanitária
  {
    id: 'cat-animais-peconhentos',
    name: 'Infestação de Animais Peçonhentos',
    iconName: 'bug',
    color: '#ef4444',
    defaultDepartmentId: 'dep-saude',
    defaultPriority: 'urgent',
    createdAt: Date.now()
  },
  {
    id: 'cat-maus-tratos',
    name: 'Maus-Tratos a Animais',
    iconName: 'heart',
    color: '#ec4899',
    defaultDepartmentId: 'dep-saude',
    defaultPriority: 'high',
    createdAt: Date.now()
  },

  // Ordem Pública / Fiscalização
  {
    id: 'cat-poluicao-sonora',
    name: 'Poluição Sonora / Perturbação do Sossego',
    iconName: 'volume-2',
    color: '#f97316',
    defaultDepartmentId: 'dep-meio',
    defaultPriority: 'medium',
    createdAt: Date.now()
  },
  {
    id: 'cat-ocupacao-irregular',
    name: 'Ocupação Irregular de Área Pública',
    iconName: 'tent',
    color: '#a8a29e',
    defaultDepartmentId: 'dep-infra',
    defaultPriority: 'medium',
    createdAt: Date.now()
  }
];

async function insertCategories() {
  console.log('Inserting new categories...');
  
  for (const cat of newCategories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting ${cat.name}:`, error.message);
    } else {
      console.log(`Inserted: ${cat.name}`);
    }
  }
  
  console.log('Done!');
}

insertCategories();
