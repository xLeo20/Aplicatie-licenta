import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    FaTicketAlt, FaExclamationCircle, FaCheckDouble, 
    FaFolderOpen, FaChartPie, FaFireAlt, FaRegClock
} from 'react-icons/fa';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getTickets } from '../../features/tickets/ticketSlice';
import Spinner from '../Spinner';

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

function AgentDashboard() {
  const dispatch = useDispatch();
  
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initial fetch al cozii de tichete
    dispatch(getTickets());

    // Setam ascultatorii de socket pentru real-time update pe dashboard
    socket.on('tichet_nou_creat', () => {
        dispatch(getTickets()); 
    });

    socket.on('ticketUpdated', () => {
        dispatch(getTickets()); 
    });

    return () => {
        socket.off('tichet_nou_creat');
        socket.off('ticketUpdated');
    };
  }, [dispatch]);

  // Prevenim randarea partiala a graficelor cat timp state-ul se hidrateaza
  if (isLoading && !isSuccess) {
      return <Spinner />;
  }

  // Agregare date pentru widget-urile din top
  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new').length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;
  
  // Filtrare stricta: Extragem doar tichetele atribuite ID-ului agentului logat
  const myTickets = tickets.filter(t => {
      if (!t.assignedTo) return false;
      const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo._id : t.assignedTo;
      return assignedId === user._id && t.status !== 'closed';
  });

  // Verificare SLA: Deadline depasit la momentul randarii
  const breachedSLA = tickets.filter(t => 
      t.status !== 'closed' && t.deadline && new Date(t.deadline) < new Date()
  ).length;

  // Mapping pentru dataset-ul PieChart
  const statusData = [
    { name: 'Noi', value: newTickets, color: '#10b981' }, 
    { name: 'In Lucru', value: openTickets, color: '#3b82f6' }, 
    { name: 'Suspendate', value: tickets.filter(t => t.status === 'suspended').length, color: '#f59e0b' }, 
    { name: 'Inchise', value: closedTickets, color: '#ef4444' }, 
  ].filter(item => item.value > 0); // Evitam randarea label-urilor cu 0%

  // Mapping pentru dataset-ul BarChart
  const priorityData = [
    { name: 'Critica (Mare)', Tichete: tickets.filter(t => t.priority === 'Mare').length },
    { name: 'Medie', Tichete: tickets.filter(t => t.priority === 'Medie').length },
    { name: 'Mica', Tichete: tickets.filter(t => t.priority === 'Mica' || !t.priority).length },
  ];

  // Micro-componenta reutilizabila pt afisarea metricilor
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:bg-slate-800/50 transition-all">
        <div className={`absolute -right-6 -top-6 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 ${color}`}>
            {icon}
        </div>
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-4xl font-black text-white">{value}</h3>
                {subtitle && <p className={`text-xs mt-2 font-bold ${color}`}>{subtitle}</p>}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5 bg-white/5 ${color}`}>
                {icon}
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
              <h2 className="text-3xl font-black text-white uppercase italic drop-shadow-md">
                  Performance Dashboard
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                  Bun venit, <span className="text-blue-400 font-bold">{user.name}</span>. Iata sumarul activitatii.
              </p>
          </div>
          <div className="flex gap-3">
              <Link to="/tickets" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-lg">
                  <FaFolderOpen /> Vezi Toate Tichetele
              </Link>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Tichete Atribuite Mie" 
              value={myTickets.length} 
              icon={<FaChartPie />} 
              color="text-blue-400" 
              subtitle="In lucru sau noi"
          />
          <StatCard 
              title="Asteapta Preluare" 
              value={newTickets} 
              icon={<FaTicketAlt />} 
              color="text-emerald-400" 
              subtitle="Tichete neasignate (Status: Nou)"
          />
          <StatCard 
              title="SLA Depasit" 
              value={breachedSLA} 
              icon={<FaFireAlt />} 
              color="text-red-500" 
              subtitle="Tichete cu termen expirat!"
          />
          <StatCard 
              title="Rata de Rezolvare" 
              // Cast in format procentual pentru UX mai bun
              value={totalTickets > 0 ? `${Math.round((closedTickets / totalTickets) * 100)}%` : '0%'} 
              icon={<FaCheckDouble />} 
              color="text-purple-400" 
              subtitle={`${closedTickets} din ${totalTickets} total`}
          />
      </div>

      {/* Container Chart.js / Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-lg">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaChartPie className="text-blue-400" /> Distributie pe Statusuri
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                              {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                              itemStyle={{ color: '#fff' }}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-lg">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaExclamationCircle className="text-red-400" /> Tichete pe Prioritati
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                          <YAxis stroke="#94a3b8" tick={{fontSize: 12}} allowDecimals={false} />
                          <Tooltip 
                              cursor={{fill: '#1e293b'}} 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                          />
                          <Bar dataKey="Tichete" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

      </div>

      {/* Componenta Tabel - Task Queue */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-[2rem] p-6 lg:p-8 shadow-[0_0_30px_rgba(59,130,246,0.1)] mt-8">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <FaRegClock className="text-blue-400" /> Coada Mea de Lucru
              </h3>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                  {myTickets.length} Active
              </span>
          </div>

          {myTickets.length === 0 ? (
              <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <FaCheckDouble className="mx-auto text-4xl text-emerald-500 mb-3 opacity-50" />
                  <p className="text-slate-400 italic">Nu ai niciun task alocat momentan. Coada de preluare este curata.</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                              <th className="p-3 font-bold">ID Tichet</th>
                              <th className="p-3 font-bold">Tip / Categorie</th>
                              <th className="p-3 font-bold">Prioritate</th>
                              <th className="p-3 font-bold text-right">Actiune</th>
                          </tr>
                      </thead>
                      <tbody>
                          {/* Limitarea listei la 5 randuri pentru a mentine dashboard-ul curat */}
                          {myTickets.slice(0, 5).map(ticket => (
                              <tr key={ticket._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                  <td className="p-3 font-mono text-sm text-blue-300">
                                      #{ticket.ticketId || ticket._id.substring(ticket._id.length - 4)}
                                  </td>
                                  
                                  <td className="p-3 text-white font-medium truncate max-w-[200px]">
                                      <span className="block text-xs font-bold opacity-70">[{ticket.issueType || 'N/A'}]</span>
                                      {ticket.category || 'N/A'}
                                  </td>
                                  
                                  <td className="p-3">
                                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                          ticket.priority === 'Mare' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                          ticket.priority === 'Medie' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                          'bg-slate-700/50 text-slate-300 border border-slate-600'
                                      }`}>
                                          {ticket.priority || 'Mica'}
                                      </span>
                                  </td>
                                  <td className="p-3 text-right">
                                      <Link to={`/ticket/${ticket._id}`} className="text-blue-400 hover:text-blue-300 font-bold text-sm bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors inline-block">
                                          Deschide
                                      </Link>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {/* Link catre tabelul complet daca numarul activitatilor > 5 */}
                  {myTickets.length > 5 && (
                      <div className="mt-4 text-center">
                          <Link to="/tickets" className="text-slate-400 hover:text-white text-sm text-center italic transition-colors">
                              + Vezi restul de {myTickets.length - 5} tichete din lista ta
                          </Link>
                      </div>
                  )}
              </div>
          )}
      </div>

    </div>
  )
}

export default AgentDashboard;