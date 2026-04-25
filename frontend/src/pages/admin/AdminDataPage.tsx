// export { default } from '../../app/admin/data/page'
import { useState } from "react"
import { 
  Search, 
  Plus,
  Ticket,
  Plane,
  Globe,
  Cloud
} from "lucide-react"

const tabs = ['Airlines', 'Airports', 'Routes', 'Hubs']

const airlines = [
  { 
    id: '1',
    name: 'Lufthansa', 
    code: 'DLH', 
    alliance: 'STAR ALLIANCE',
    fleet: 284,
    flights: 1240,
    active: true
  },
  { 
    id: '2',
    name: 'Emirates', 
    code: 'UAE', 
    alliance: 'MIDDLE EAST',
    fleet: 262,
    flights: 580,
    active: true
  },
  { 
    id: '3',
    name: 'Delta Air Lines', 
    code: 'DAL', 
    alliance: 'SKYTEAM',
    fleet: 921,
    flights: 4000,
    active: false
  }
]

export default function AdminDataPage() {
  const [activeTab, setActiveTab] = useState('Airlines')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Search & Editorial Headline */}
      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00236f]">Master Data Management</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#00236f] leading-tight">
            Global Entity<br />Directory
          </h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search airlines, hubs, or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-[#f2f4f6] border-none rounded-xl focus:ring-2 focus:ring-[#00236f]/40 transition-all placeholder:text-slate-400"
          />
        </div>
      </section>

      {/* Dynamic Filter Tabs */}
      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full text-sm font-bold tracking-tight flex-shrink-0 transition-all ${
              activeTab === tab
                ? 'bg-[#00236f] text-white shadow-lg shadow-[#00236f]/20'
                : 'bg-[#e6e8ea] text-slate-500 hover:bg-[#e0e3e5]'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Network Map Overview */}
      <section className="relative h-48 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00236f] to-[#1e3a8a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00236f]/90 to-transparent p-6 flex flex-col justify-end">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Network Status</span>
              <h3 className="text-xl font-bold text-white">Hub Connections</h3>
            </div>
            <div className="px-3 py-1 bg-[#6bff8f] text-[#002109] text-[10px] font-black rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#004b1e] rounded-full" />
              ACTIVE
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <Globe className="w-16 h-16 text-white/10" />
        </div>
      </section>

      {/* Airline Entity List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Active Carriers</h3>
          <span className="text-[10px] font-bold text-[#00236f] px-3 py-1 bg-[#00236f]/10 rounded-full">
            {airlines.length} TOTAL
          </span>
        </div>

        <div className="space-y-4">
          {airlines.map((airline) => (
            <div 
              key={airline.id}
              className={`bg-white p-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,35,111,0.05)] flex flex-col gap-4 ${
                airline.active ? 'border-l-4 border-[#00236f]' : 'border-l-4 border-[#00236f]/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#f2f4f6] rounded-xl flex items-center justify-center">
                    {airline.active ? (
                      <Ticket className="w-6 h-6 text-[#00236f]" />
                    ) : (
                      <Plane className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{airline.name}</h4>
                    <p className="text-xs font-semibold text-slate-400 tracking-wider">{airline.code} - {airline.alliance}</p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={airline.active}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00236f]" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`bg-[#f2f4f6]/50 p-3 rounded-xl ${!airline.active && 'opacity-60'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Active Fleet</p>
                  <p className="text-base font-bold text-[#00236f]">{airline.fleet} Aircraft</p>
                </div>
                <div className={`bg-[#f2f4f6]/50 p-3 rounded-xl ${!airline.active && 'opacity-60'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Daily Routes</p>
                  <p className="text-base font-bold text-[#00236f]">{airline.flights.toLocaleString()} Flights</p>
                </div>
              </div>

              <button className={`w-full py-3 font-bold text-sm rounded-xl transition-all active:scale-[0.98] ${
                airline.active
                  ? 'bg-[#b7c4fd] text-[#435081] hover:bg-[#b7c4fd]/80'
                  : 'bg-[#e6e8ea] text-slate-400'
              }`}>
                {airline.active ? 'Manage Fleet' : 'Maintenance Mode'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Overview Card */}
      <section className="bg-[#00236f] p-6 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,35,111,0.06)] text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Data Health</p>
          <h4 className="text-2xl font-black">98.4% Sync</h4>
          <p className="text-[10px] text-white/80 mt-1">Last update: 2 mins ago</p>
        </div>
        <div className="relative z-10 w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
          <Cloud className="w-8 h-8" />
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#1e3a8a] rounded-full opacity-50" />
      </section>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-[#00236f] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90 z-40 lg:hidden">
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}

