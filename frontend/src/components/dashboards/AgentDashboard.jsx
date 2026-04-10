import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    FaTicketAlt, FaExclamationCircle, FaCheckDouble, 
    FaFolderOpen, FaChartPie, FaFireAlt, FaRegClock, FaChartLine,
    FaTrophy, FaStar, FaMedal
} from 'react-icons/fa';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
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
    dispatch(getTickets());

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

  if (isLoading && !isSuccess) {
      return <Spinner />;
  }

  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new').length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;
  
  const myTickets = tickets.filter(t => {
      if (!t.assignedTo) return false;
      const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo._id : t.assignedTo;
      return assignedId === user._id && t.status !== 'closed';
  });

  // LOGICA DE COMPETITIE / GAMIFICARE
  const agentScores = {};
  tickets.filter(t => t.status === 'closed' && t.assignedTo).forEach(t => {
      const agentId = typeof t.assignedTo === 'object' ? t.assignedTo._id : t.assignedTo;
      agentScores[agentId] = (agentScores[agentId] || 0) + 1;
  });

  const myResolvedTickets = agentScores[user._id] || 0;

  const otherScores = Object.keys(agentScores)
      .filter(id => id !== user._id)
      .map(id => agentScores[id]);
      
  const maxOtherScore = otherScores.length > 0 ? Math.max(...otherScores) : 0;

  let agentRank = 'Agent Începător';
  let rankColor = 'text-slate-400'; 
  let rankIcon = <FaMedal className="text-slate-400 text-4xl" />;
  let bonusMessage = 'Începe să rezolvi tichete pentru a intra în clasament.';
  let xpProgress = 0;

  if (myResolvedTickets === 0 && maxOtherScore === 0) {
      agentRank = 'Echipa la Start';
      bonusMessage = 'Fii primul din echipă care rezolvă un tichet!';
  } else if (myResolvedTickets > maxOtherScore) {
      agentRank = 'Lider Departament 🏆';
      rankColor = 'text-yellow-400';
      rankIcon = <FaTrophy className="text-yellow-400 text-4xl drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />;
      bonusMessage = `Dominație totală! Ai cu ${myResolvedTickets - maxOtherScore} mai multe tichete decât locul 2.`;
      xpProgress = 100;
  } else if (myResolvedTickets === maxOtherScore && myResolvedTickets > 0) {
      agentRank = 'Co-Lider Echipă ⚔️';
      rankColor = 'text-amber-400';
      rankIcon = <FaTrophy className="text-amber-400 text-4xl drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />;
      bonusMessage = 'Competiție strânsă! Ești la egalitate pe primul loc. Mai rezolvă un tichet!';
      xpProgress = 90; 
  } else {
      const maxScore = maxOtherScore; 
      if (myResolvedTickets >= maxScore * 0.7) {
          agentRank = 'Senior Specialist ⭐';
          rankColor = 'text-blue-400';
          rankIcon = <FaStar className="text-blue-400 text-4xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />;
          bonusMessage = `Mai ai nevoie de ${maxScore - myResolvedTickets + 1} tichete pentru a trece pe primul loc!`;
          xpProgress = (myResolvedTickets / maxScore) * 100;
      } else if (myResolvedTickets >= maxScore * 0.3) {
          agentRank = 'Agent Activ';
          rankColor = 'text-emerald-400';
          rankIcon = <FaMedal className="text-emerald-400 text-4xl" />;
          bonusMessage = `Liderul are ${maxScore} tichete rezolvate. Mărește ritmul!`;
          xpProgress = (myResolvedTickets / maxScore) * 100;
      } else {
          agentRank = 'Junior Support';
          rankColor = 'text-slate-400';
          rankIcon = <FaMedal className="text-slate-400 text-4xl" />;
          bonusMessage = `Liderul a rezolvat deja ${maxScore} tichete. Rezolvă mai multe pentru a avansa!`;
          xpProgress = maxScore > 0 ? (myResolvedTickets / maxScore) * 100 : 0;
      }
  }

  const breachedSLA = tickets.filter(t => 
      t.status !== 'closed' && t.deadline && new Date(t.deadline) < new Date()
  ).length;

  const statusData = [
    { name: 'Noi', value: newTickets, color: '#10b981' }, 
    { name: 'În Lucru', value: openTickets, color: '#3b82f6' }, 
    { name: 'Suspendate', value: tickets.filter(t => t.status === 'suspended').length, color: '#f59e0b' }, 
    { name: 'Închise', value: closedTickets, color: '#ef4444' }, 
  ].filter(item => item.value > 0); 

  const priorityData = [
    { name: 'Critică (Mare)', Tichete: tickets.filter(t => t.priority === 'Mare').length },
    { name: 'Medie', Tichete: tickets.filter(t => t.priority === 'Medie').length },
    { name: 'Mică', Tichete: tickets.filter(t => t.priority === 'Mica' || !t.priority).length },
  ];

  const groupedDates = tickets.reduce((acc, ticket) => {
      const d = new Date(ticket.createdAt).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
  }, {});

  const timelineData = Object.keys(groupedDates).map(key => ({
      name: key,
      Tichete: groupedDates[key]
  })).reverse().slice(-14);

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
      
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
              <h2 className="text-3xl font-black text-white uppercase italic drop-shadow-md">
                  Performance Dashboard
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                  Bun venit, <span className="text-blue-400 font-bold">{user.name}</span>. Iată sumarul activității tale.
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
              subtitle="În lucru sau noi"
          />
          <StatCard 
              title="Așteaptă Preluare" 
              value={newTickets} 
              icon={<FaTicketAlt />} 
              color="text-emerald-400" 
              subtitle="Tichete neasignate (Nou)"
          />
          <StatCard 
              title="SLA Depășit" 
              value={breachedSLA} 
              icon={<FaFireAlt />} 
              color="text-red-500" 
              subtitle="Tichete cu termen expirat!"
          />
          <StatCard 
              title="Rata de Rezolvare" 
              value={totalTickets > 0 ? `${Math.round((closedTickets / totalTickets) * 100)}%` : '0%'} 
              icon={<FaCheckDouble />} 
              color="text-purple-400" 
              subtitle={`${closedTickets} din ${totalTickets} total`}
          />
      </div>

      <div className="w-full bg-gradient-to-r from-slate-900/80 to-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] p-6 lg:p-8 shadow-[0_0_30px_rgba(79,70,229,0.15)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <FaStar className="absolute -top-10 -right-10 text-9xl text-indigo-500/10 rotate-45 pointer-events-none" />
          
          <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-full border border-white/10 w-32 h-32 relative z-10 shadow-inner">
              {rankIcon}
          </div>
          
          <div className="flex-1 w-full relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
                  <div>
                      <h3 className="text-white text-xs font-black uppercase tracking-widest opacity-60 mb-1">Status Performanță Comparativă</h3>
                      <h2 className={`text-3xl font-black ${rankColor} uppercase tracking-tighter drop-shadow-md`}>{agentRank}</h2>
                  </div>
                  <div className="text-right">
                      <span className="text-3xl font-black text-white">{myResolvedTickets}</span>
                      <span className="text-white/50 text-sm font-bold uppercase ml-2">Rezolvate</span>
                  </div>
              </div>

              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-white/10 shadow-inner mb-3">
                  <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-indigo-500 
                      ${myResolvedTickets > maxOtherScore ? 'from-yellow-400 to-amber-500' : ''}
                      ${myResolvedTickets === maxOtherScore && myResolvedTickets > 0 ? 'from-amber-400 to-orange-500' : ''}`}
                      style={{ width: `${Math.min(xpProgress, 100)}%` }}
                  ></div>
              </div>
              
              <p className="text-indigo-200/80 text-sm font-medium flex items-center gap-2">
                  <FaCheckDouble className="text-emerald-400" /> {bonusMessage}
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-lg">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <FaChartPie className="text-blue-400" /> Distribuție pe Statusuri
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
                  <FaExclamationCircle className="text-red-400" /> Tichete pe Priorități
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

      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-lg">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <FaChartLine className="text-emerald-400" /> Volum Tichete Noi (Ultimele 14 zile active)
          </h3>
          <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} allowDecimals={false} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                          cursor={{ stroke: '#334155', strokeWidth: 2 }}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="Tichete" 
                          stroke="#10b981" 
                          strokeWidth={4} 
                          dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} 
                          activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} 
                      />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>

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
                  <p className="text-slate-400 italic">Nu ai niciun task alocat momentan. Coada de preluare este curată.</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                              <th className="p-3 font-bold">ID Tichet</th>
                              <th className="p-3 font-bold">Tip / Categorie</th>
                              <th className="p-3 font-bold">Prioritate</th>
                              <th className="p-3 font-bold text-right">Acțiune</th>
                          </tr>
                      </thead>
                      <tbody>
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
                                          {ticket.priority || 'Mică'}
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