import { useState, useMemo } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const PANEL_RATE = 8; // $ per panel cleaned
const TODAY = '2026-05-04';
const MONTH = '2026-05';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DATES = [
  '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07',
  '2026-05-08', '2026-05-09', '2026-05-10',
];

const STATUS_COLORS = {
  'Scheduled':  'bg-blue-100 text-blue-700',
  'En Route':   'bg-amber-100 text-amber-700',
  'In Progress':'bg-orange-100 text-orange-700',
  'Complete':   'bg-green-100 text-green-700',
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const TECHS_INIT = [
  { id: 1, name: 'Jake M.',  phone: '604-555-0101', status: 'Available' },
  { id: 2, name: 'Rosa T.',  phone: '604-555-0202', status: 'On Job'    },
  { id: 3, name: 'Devon C.', phone: '604-555-0303', status: 'Available' },
];

const CUSTOMERS_INIT = [
  {
    id: 1, name: 'Sarah Chen', type: 'Residential',
    address: '4521 Oak St, Vancouver', phone: '604-555-1001',
    systemSize: 8,  panelCount: 24,
    lastCleaned: '2026-02-15', nextDue: '2026-05-15',
    notes: '24-panel 8 kW system, east-facing roof. Gate code: 1492.',
  },
  {
    id: 2, name: 'Pacific Rim Logistics', type: 'Commercial',
    address: '1200 Terminal Ave, Vancouver', phone: '604-555-2002',
    systemSize: 16, panelCount: 48,
    lastCleaned: '2026-01-20', nextDue: '2026-04-20',
    notes: '48-panel 16 kW commercial array, flat roof access via east stairwell.',
  },
  {
    id: 3, name: 'Marcus Wong', type: 'Residential',
    address: '7834 Granville St, Vancouver', phone: '604-555-1003',
    systemSize: 6,  panelCount: 18,
    lastCleaned: '2026-03-10', nextDue: '2026-06-10',
    notes: '18-panel 6 kW system, steep pitch — use safety harness.',
  },
  {
    id: 4, name: 'Sunrise Farms', type: 'Commercial',
    address: '2300 Agricultural Rd, Richmond', phone: '604-555-3004',
    systemSize: 32, panelCount: 96,
    lastCleaned: '2025-12-05', nextDue: '2026-03-05',
    notes: '96-panel 32 kW agricultural array, ground-mounted. Bring full commercial kit.',
  },
  {
    id: 5, name: 'Linda Park', type: 'Residential',
    address: '3312 Cambie St, Vancouver', phone: '604-555-1005',
    systemSize: 10, panelCount: 30,
    lastCleaned: '2026-02-28', nextDue: '2026-05-28',
    notes: '30-panel 10 kW system, south-facing. Easy roof access.',
  },
  {
    id: 6, name: 'Westcoast Medical Centre', type: 'Commercial',
    address: '889 West 12th Ave, Vancouver', phone: '604-555-4006',
    systemSize: 24, panelCount: 72,
    lastCleaned: '2026-01-08', nextDue: '2026-04-08',
    notes: '72-panel 24 kW medical building array. Check in with security on arrival.',
  },
];

const JOBS_INIT = [
  { id: 1, customerId: 1, techId: 1, date: '2026-05-04', time: '09:00', status: 'Complete',    notes: 'Regular quarterly clean.' },
  { id: 2, customerId: 2, techId: 2, date: '2026-05-04', time: '11:00', status: 'In Progress', notes: 'Post-winter deep clean.' },
  { id: 3, customerId: 3, techId: 3, date: '2026-05-05', time: '08:30', status: 'Scheduled',   notes: '' },
  { id: 4, customerId: 4, techId: 1, date: '2026-05-05', time: '13:00', status: 'Scheduled',   notes: 'Large commercial job — bring full kit.' },
  { id: 5, customerId: 5, techId: 2, date: '2026-05-06', time: '09:00', status: 'Scheduled',   notes: '' },
  { id: 6, customerId: 6, techId: 3, date: '2026-05-07', time: '10:00', status: 'Scheduled',   notes: 'Check in with building security first.' },
  { id: 7, customerId: 1, techId: 2, date: '2026-04-28', time: '09:00', status: 'Complete',    notes: 'Routine spring clean.' },
  { id: 8, customerId: 3, techId: 1, date: '2026-04-30', time: '08:00', status: 'Complete',    notes: '' },
];

// ─── Small reusable components ────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function Modal({ title, onClose, children, onSubmit, submitLabel = 'Save' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onSubmit} className="flex-1 bg-orange-400 hover:bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold transition">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300';

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function SolarDesk() {
  const [tab, setTab]             = useState('dashboard');
  const [jobs, setJobs]           = useState(JOBS_INIT);
  const [customers, setCustomers] = useState(CUSTOMERS_INIT);
  const [techs]                   = useState(TECHS_INIT);
  const [showAddJob, setShowAddJob]           = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const blankJob = { customerId: '', techId: '', date: TODAY, time: '09:00', notes: '' };
  const blankCust = { name: '', address: '', phone: '', systemSize: '', panelCount: '', type: 'Residential', notes: '' };
  const [newJob, setNewJob]       = useState(blankJob);
  const [newCustomer, setNewCustomer] = useState(blankCust);

  // ── Lookups ─────────────────────────────────────────────────────────────────
  const getCustomer = (id) => customers.find(c => c.id === id);
  const getTech     = (id) => techs.find(t => t.id === id);
  const getPanels   = (job) => getCustomer(job.customerId)?.panelCount ?? 0;

  // ── Derived stats ────────────────────────────────────────────────────────────
  const todayJobs    = useMemo(() => jobs.filter(j => j.date === TODAY), [jobs]);
  const todayDone    = useMemo(() => todayJobs.filter(j => j.status === 'Complete'), [todayJobs]);
  const todayRevenue = useMemo(() => todayDone.reduce((s, j) => s + getPanels(j) * PANEL_RATE, 0), [todayDone]);

  const monthDone   = useMemo(() => jobs.filter(j => j.date.startsWith(MONTH) && j.status === 'Complete'), [jobs]);
  const monthPanels = useMemo(() => monthDone.reduce((s, j) => s + getPanels(j), 0), [monthDone]);

  const upcomingJobs = useMemo(() =>
    jobs
      .filter(j => WEEK_DATES.includes(j.date) && j.status !== 'Complete')
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 5),
    [jobs]
  );

  const techStats = useMemo(() =>
    techs.map(t => {
      const done = jobs.filter(j => j.techId === t.id && j.date.startsWith(MONTH) && j.status === 'Complete');
      return { ...t, jobsMonth: done.length, panelsMonth: done.reduce((s, j) => s + getPanels(j), 0) };
    }),
    [jobs, techs]
  );

  // ── Actions ──────────────────────────────────────────────────────────────────
  const markComplete = (id) =>
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Complete' } : j));

  const addJob = () => {
    if (!newJob.customerId || !newJob.techId) return;
    setJobs(prev => [...prev, {
      id: prev.length + 1,
      customerId: +newJob.customerId,
      techId:     +newJob.techId,
      date: newJob.date, time: newJob.time,
      status: 'Scheduled', notes: newJob.notes,
    }]);
    setShowAddJob(false);
    setNewJob(blankJob);
  };

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.address) return;
    setCustomers(prev => [...prev, {
      id: prev.length + 1,
      ...newCustomer,
      systemSize: parseFloat(newCustomer.systemSize) || 0,
      panelCount: parseInt(newCustomer.panelCount)  || 0,
      lastCleaned: '', nextDue: '',
    }]);
    setShowAddCustomer(false);
    setNewCustomer(blankCust);
  };

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'dashboard',   label: '📊 Dashboard'    },
    { id: 'schedule',    label: '📅 Schedule'      },
    { id: 'customers',   label: '👥 Customers'     },
    { id: 'technicians', label: '🔧 Technicians'   },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow">☀️</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">SolarDesk</h1>
              <p className="text-yellow-100 text-xs mt-0.5">Field Service & CRM</p>
            </div>
          </div>
          <p className="text-yellow-100 text-sm hidden sm:block">
            {new Date(TODAY + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0.5 mt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-gray-50 text-orange-600 shadow-sm'
                  : 'text-white/90 hover:bg-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ══════════════ DASHBOARD ══════════════ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Jobs",       value: todayJobs.length,              icon: '📋', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
                { label: 'Completed Today',     value: todayDone.length,              icon: '✅', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
                { label: "Today's Revenue",     value: `$${todayRevenue.toLocaleString()}`, icon: '💰', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
                { label: 'Panels Cleaned (Mo)', value: monthPanels,                   icon: '🔆', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} ${s.border}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className={`text-3xl font-extrabold ${s.text}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Upcoming jobs */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-700">Upcoming This Week</h2>
                  <button
                    onClick={() => { setTab('schedule'); setShowAddJob(true); }}
                    className="text-xs bg-orange-400 hover:bg-orange-500 text-white px-3 py-1.5 rounded-full font-semibold transition"
                  >
                    + Schedule Job
                  </button>
                </div>
                {upcomingJobs.length === 0
                  ? <p className="text-sm text-gray-400">No upcoming jobs this week.</p>
                  : upcomingJobs.map(j => {
                    const c = getCustomer(j.customerId);
                    const t = getTech(j.techId);
                    return (
                      <div key={j.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{c?.name}</p>
                          <p className="text-xs text-gray-400">{j.date} · {j.time} · {t?.name}</p>
                        </div>
                        <StatusBadge status={j.status} />
                      </div>
                    );
                  })
                }
              </div>

              {/* Tech leaderboard */}
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <h2 className="font-bold text-gray-700 mb-4">Top Techs — May</h2>
                {[...techStats]
                  .sort((a, b) => b.panelsMonth - a.panelsMonth)
                  .map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.jobsMonth} jobs · {t.panelsMonth} panels</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        t.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>{t.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ SCHEDULE ══════════════ */}
        {tab === 'schedule' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-700">Week of May 4 – 10, 2026</h2>
              <button
                onClick={() => setShowAddJob(true)}
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                + Add Job
              </button>
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DATES.map((date, i) => {
                const dayJobs = jobs.filter(j => j.date === date);
                const isToday = date === TODAY;
                return (
                  <div
                    key={date}
                    className={`rounded-2xl p-2 min-h-36 ${
                      isToday
                        ? 'bg-orange-50 border-2 border-orange-400 shadow-md'
                        : 'bg-white border border-gray-100 shadow-sm'
                    }`}
                  >
                    {/* Day header */}
                    <div className={`text-center mb-2 ${isToday ? 'text-orange-600' : 'text-gray-400'}`}>
                      <p className="text-xs font-bold uppercase tracking-wide">{WEEK_DAYS[i]}</p>
                      <p className={`text-xl font-extrabold ${isToday ? 'text-orange-500' : 'text-gray-600'}`}>
                        {date.slice(8)}
                      </p>
                    </div>

                    {/* Job cards */}
                    <div className="space-y-1.5">
                      {dayJobs.map(j => {
                        const c = getCustomer(j.customerId);
                        const t = getTech(j.techId);
                        return (
                          <div key={j.id} className="bg-white rounded-xl border border-gray-100 p-2 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 truncate">{c?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{c?.address?.split(',')[0]}</p>
                            <p className="text-xs text-gray-500">{t?.name} · {j.time}</p>
                            <div className="mt-1.5 flex items-center justify-between gap-1">
                              <StatusBadge status={j.status} />
                              {j.status !== 'Complete' && (
                                <button
                                  onClick={() => markComplete(j.id)}
                                  title="Mark complete"
                                  className="text-xs text-green-600 hover:text-green-800 font-bold leading-none"
                                >
                                  ✓
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Job modal */}
            {showAddJob && (
              <Modal title="Schedule New Job" onClose={() => { setShowAddJob(false); setNewJob(blankJob); }} onSubmit={addJob} submitLabel="Schedule Job">
                <Field label="Customer">
                  <select className={inputCls} value={newJob.customerId} onChange={e => setNewJob(p => ({ ...p, customerId: e.target.value }))}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Technician">
                  <select className={inputCls} value={newJob.techId} onChange={e => setNewJob(p => ({ ...p, techId: e.target.value }))}>
                    <option value="">Select technician…</option>
                    {techs.map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input type="date" className={inputCls} value={newJob.date} onChange={e => setNewJob(p => ({ ...p, date: e.target.value }))} />
                  </Field>
                  <Field label="Time">
                    <input type="time" className={inputCls} value={newJob.time} onChange={e => setNewJob(p => ({ ...p, time: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea rows={3} className={inputCls + ' resize-none'} value={newJob.notes} onChange={e => setNewJob(p => ({ ...p, notes: e.target.value }))} />
                </Field>
              </Modal>
            )}
          </div>
        )}

        {/* ══════════════ CUSTOMERS ══════════════ */}
        {tab === 'customers' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-700">Customers ({customers.length})</h2>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                + Add Customer
              </button>
            </div>

            <div className="space-y-3">
              {customers.map(c => {
                const isOpen  = expandedCustomer === c.id;
                const cJobs   = jobs.filter(j => j.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
                const overdue = c.nextDue && c.nextDue < TODAY;
                return (
                  <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Row */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedCustomer(isOpen ? null : c.id)}
                    >
                      <div className="w-11 h-11 rounded-full bg-yellow-100 text-yellow-600 font-extrabold text-xl flex items-center justify-center shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.address}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-6 shrink-0">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700">{c.panelCount} panels</p>
                          <p className="text-xs text-gray-400">{c.systemSize} kW</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Last cleaned</p>
                          <p className="text-sm font-semibold text-gray-700">{c.lastCleaned || '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Next due</p>
                          <p className={`text-sm font-semibold ${overdue ? 'text-red-500' : 'text-gray-700'}`}>
                            {c.nextDue || '—'} {overdue && '⚠️'}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          c.type === 'Commercial' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>{c.type}</span>
                      </div>
                      <span className="text-gray-300 ml-2">{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded */}
                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 p-5">
                        <div className="grid md:grid-cols-2 gap-5 mb-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Details</p>
                            <p className="text-sm text-gray-700">📞 {c.phone}</p>
                            <p className="text-sm text-gray-700">📍 {c.address}</p>
                            <p className="text-sm text-gray-700 mt-1">☀️ {c.panelCount} panels · {c.systemSize} kW · {c.type}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                            <p className="text-sm text-gray-600">{c.notes || 'No notes.'}</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Service History</p>
                        {cJobs.length === 0
                          ? <p className="text-sm text-gray-400">No service history.</p>
                          : (
                            <div className="space-y-1.5">
                              {cJobs.map(j => (
                                <div key={j.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2 border border-gray-100">
                                  <div>
                                    <span className="text-sm text-gray-700 font-medium">{j.date} · {j.time}</span>
                                    <span className="text-xs text-gray-400 ml-2">— {getTech(j.techId)?.name}</span>
                                  </div>
                                  <StatusBadge status={j.status} />
                                </div>
                              ))}
                            </div>
                          )
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Customer modal */}
            {showAddCustomer && (
              <Modal title="Add Customer" onClose={() => { setShowAddCustomer(false); setNewCustomer(blankCust); }} onSubmit={addCustomer} submitLabel="Add Customer">
                <Field label="Name *">
                  <input type="text" placeholder="Full name or company" className={inputCls} value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field label="Address *">
                  <input type="text" placeholder="123 Main St, Vancouver" className={inputCls} value={newCustomer.address} onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))} />
                </Field>
                <Field label="Phone">
                  <input type="tel" placeholder="604-555-0000" className={inputCls} value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="System Size (kW)">
                    <input type="number" min="0" step="0.1" className={inputCls} value={newCustomer.systemSize} onChange={e => setNewCustomer(p => ({ ...p, systemSize: e.target.value }))} />
                  </Field>
                  <Field label="Panel Count">
                    <input type="number" min="0" className={inputCls} value={newCustomer.panelCount} onChange={e => setNewCustomer(p => ({ ...p, panelCount: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Type">
                  <select className={inputCls} value={newCustomer.type} onChange={e => setNewCustomer(p => ({ ...p, type: e.target.value }))}>
                    <option>Residential</option>
                    <option>Commercial</option>
                  </select>
                </Field>
                <Field label="Notes">
                  <textarea rows={3} className={inputCls + ' resize-none'} value={newCustomer.notes} onChange={e => setNewCustomer(p => ({ ...p, notes: e.target.value }))} />
                </Field>
              </Modal>
            )}
          </div>
        )}

        {/* ══════════════ TECHNICIANS ══════════════ */}
        {tab === 'technicians' && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-5">Technicians</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {techStats.map(t => {
                const allTJobs = jobs
                  .filter(j => j.techId === t.id)
                  .sort((a, b) => b.date.localeCompare(a.date));
                const recentJobs = allTJobs.slice(0, 4);
                return (
                  <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-white font-extrabold text-xl flex items-center justify-center shadow-sm shrink-0">
                        {t.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                        t.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>{t.status}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                        <p className="text-2xl font-extrabold text-blue-700">{t.jobsMonth}</p>
                        <p className="text-xs text-blue-500 mt-0.5">Jobs this month</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                        <p className="text-2xl font-extrabold text-yellow-600">{t.panelsMonth}</p>
                        <p className="text-xs text-yellow-500 mt-0.5">Panels cleaned</p>
                      </div>
                    </div>

                    {/* Revenue estimate */}
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center mb-4">
                      <p className="text-lg font-extrabold text-green-700">${(t.panelsMonth * PANEL_RATE).toLocaleString()}</p>
                      <p className="text-xs text-green-500">Revenue generated (est.)</p>
                    </div>

                    {/* Recent jobs */}
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Jobs</p>
                    {recentJobs.length === 0
                      ? <p className="text-xs text-gray-400">No jobs yet.</p>
                      : recentJobs.map(j => {
                        const c = getCustomer(j.customerId);
                        return (
                          <div key={j.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-700 truncate">{c?.name}</p>
                              <p className="text-xs text-gray-400">{j.date}</p>
                            </div>
                            <StatusBadge status={j.status} />
                          </div>
                        );
                      })
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
