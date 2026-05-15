import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Trophy, Medal, Award, TrendingUp, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface RankingUser {
  id: string;
  name: string;
  points: number;
  ticketsResolved: number;
  avatarUrl?: string;
  rank: number;
}

export function CitizenRanking() {
  const navigate = useNavigate();
  const { currentUser, tickets } = useAppContext();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        // 1. Fetch all users who are citizens
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, avatarUrl')
          .eq('role', 'citizen');

        if (!usersData) return;

        // 2. Fetch all tickets to calculate scores
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('userId, status');

        if (!ticketsData) return;

        // 3. Process scores
        const userScores = usersData.map(user => {
          const userTickets = ticketsData.filter(t => (t.userId || t.userid) === user.id);
          const resolved = userTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
          const ongoing = userTickets.filter(t => !['resolved', 'closed', 'rejected', 'duplicated'].includes(t.status)).length;
          
          return {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            ticketsResolved: resolved,
            points: (ongoing * 10) + (resolved * 50)
          };
        });

        // 4. Sort by points
        const sortedRanking = userScores
          .sort((a, b) => b.points - a.points)
          .map((u, index) => ({ ...u, rank: index + 1 }));

        setRanking(sortedRanking);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const myRankInfo = ranking.find(r => r.id === currentUser?.id);

  return (
    <div className="p-4 md:p-6 lg:max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ranking de Cidadania</h2>
          <p className="text-xs text-slate-500 font-medium">Reconhecendo quem cuida da nossa cidade</p>
        </div>
      </div>

      {/* My Stats Highlight */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 p-1 flex items-center justify-center text-2xl font-black">
              {myRankInfo ? `#${myRankInfo.rank}` : '--'}
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Sua Posição</p>
              <h3 className="text-2xl font-black tracking-tight">{currentUser?.name}</h3>
              <p className="text-sm text-blue-100/80 font-medium">{myRankInfo?.points || 0} Pontos Acumulados</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
             <Trophy className="w-12 h-12 text-amber-400 opacity-80" />
          </div>
        </div>
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mb-2">
               <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 1</span>
            <span className="text-sm font-bold text-slate-800 truncate w-full mt-1">
              {ranking[0]?.name || '---'}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
               <Medal className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 2</span>
            <span className="text-sm font-bold text-slate-800 truncate w-full mt-1">
              {ranking[1]?.name || '---'}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-2">
               <Award className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 3</span>
            <span className="text-sm font-bold text-slate-800 truncate w-full mt-1">
              {ranking[2]?.name || '---'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Global Leaderboard */}
      <Card className="overflow-hidden border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Líderes da Zeladoria
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">Carregando ranking...</div>
            ) : ranking.length > 0 ? (
              ranking.map((user) => (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${user.id === currentUser?.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : ''}`}
                >
                  <div className="w-8 text-center">
                    {user.rank === 1 ? (
                      <span className="flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="flex items-center justify-center">
                        <Medal className="w-5 h-5 text-slate-400" />
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="flex items-center justify-center">
                        <Award className="w-5 h-5 text-orange-400" />
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-slate-400">#{user.rank}</span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 font-bold uppercase text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${user.id === currentUser?.id ? 'text-blue-700' : 'text-slate-800'}`}>
                      {user.name} {user.id === currentUser?.id && '(Você)'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                      {user.ticketsResolved} chamados resolvidos
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{user.points}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pontos</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">Nenhum dado disponível.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" /> Como ganhar pontos?
        </h4>
        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 font-medium">
          <li><strong>Relatar ocorrência:</strong> Ganhe <span className="text-[#1E3A8A] font-bold">10 pontos</span> por cada novo chamado registrado.</li>
          <li><strong>Ocorrência resolvida:</strong> Receba um bônus de <span className="text-emerald-600 font-bold">50 pontos</span> quando a prefeitura resolver o problema.</li>
          <li>Sua pontuação ajuda a prefeitura a priorizar regiões com cidadãos mais ativos!</li>
        </ul>
      </div>
    </div>
  );
}
