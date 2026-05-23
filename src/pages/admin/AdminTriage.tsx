import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { AlertCircle, Check, X, ArrowRight } from 'lucide-react';
import { AdminTicketDetailsModal } from '../../components/admin/AdminTicketDetailsModal';
import { Ticket } from '../../data/types';

import { supabase } from '../../lib/supabase';

export function AdminTriage() {
  const { tickets, categories, updateTicketStatus } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const triageTickets = tickets.filter(t => t.status === 'received' || t.status === 'triage');

  if (triageTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Fila Vazia</h2>
        <p>Não há chamados pendentes de triagem no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fila de Triagem</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">{triageTickets.length} pendentes</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {triageTickets.map(ticket => {
          const category = categories.find(c => c.id === ticket.categoryId);
          return (
            <Card key={ticket.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{ticket.protocol}</p>
                  <CardTitle className="mt-1 text-lg">{ticket.title}</CardTitle>
                </div>
                <span className="text-xs text-slate-400">{format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </CardHeader>
              <CardContent className="py-4 flex-1 flex flex-col md:flex-row gap-4">
                {ticket.photoUrl ? (
                  <img src={ticket.photoUrl.split(',')[0]} alt="Problema" className="w-full md:w-48 h-32 object-cover rounded-md flex-shrink-0" />
                ) : (
                  <div className="w-full md:w-48 h-32 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 text-slate-400">
                    Sem foto
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <div>
                     <p className="text-sm text-slate-600 line-clamp-3">{ticket.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-slate-400 text-xs">Categoria Sugerida</span>
                      <span className="font-medium">{category?.name}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs">Local</span>
                      <span className="font-medium truncate block" title={ticket.address}>{ticket.neighborhood}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100 pt-4 flex flex-wrap gap-2 justify-end">
                 <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setSelectedTicket(ticket)}>Analisar Detalhes</Button>
                 
                 <Button 
                   variant="outline" 
                   size="sm" 
                   icon={X} 
                   className="text-red-600 hover:bg-red-50"
                   onClick={async () => {
                     if (confirm('Deseja indeferir este chamado?')) {
                       await updateTicketStatus(ticket.id, 'rejected');
                     }
                   }}
                 >
                   Indeferir
                 </Button>

                 <Button 
                   variant="outline" 
                   size="sm" 
                   icon={AlertCircle}
                   onClick={async () => {
                     const comment = prompt('Insira o protocolo do chamado original (duplicado):');
                     if (comment) {
                       await updateTicketStatus(ticket.id, 'duplicated');
                       await supabase.from('ticket_history').insert({
                         ticketId: ticket.id,
                         userId: (await supabase.auth.getUser()).data.user?.id,
                         action: 'Marcado como duplicado',
                         newStatus: 'duplicated',
                         comment: `Original: ${comment}`
                       });
                     }
                   }}
                 >
                   Duplicado
                 </Button>

                 <Button 
                   size="sm" 
                   icon={ArrowRight} 
                   className="bg-[#1E3A8A]"
                   onClick={async () => {
                     await updateTicketStatus(ticket.id, 'forwarded');
                   }}
                 >
                   Encaminhar Sec.
                 </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selectedTicket && (
        <AdminTicketDetailsModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
}
