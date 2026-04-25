// export { default } from '../../app/booking/seats/page'
import { useState } from 'react'
import { motion } from 'framer-motion'

import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

type SeatStatus = 'available' | 'selected' | 'booked'

interface Seat {
  id: string
  row: number
  col: string
  status: SeatStatus
  price?: number
}

const generateSeats = (): Seat[] => {
  const seats: Seat[] = []
  const columns = ['A', 'B', 'C', 'D']
  for (let row = 12; row <= 17; row++) {
    for (const col of columns) {
      const isBooked = Math.random() > 0.7
      seats.push({
        id: `${row}${col}`,
        row,
        col,
        status: isBooked ? 'booked' : 'available',
        price: 1850,
      })
    }
  }
  return seats
}

const initialSeats = generateSeats()
// Pre-select seat 14A
initialSeats.find(s => s.id === '14A')!.status = 'selected'

export default function SeatSelectionPage() {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const selectedSeat = seats.find(s => s.status === 'selected')

  const handleSeatClick = (seatId: string) => {
    setSeats(prev => prev.map(seat => {
      if (seat.status === 'booked') return seat
      if (seat.id === seatId) {
        return { ...seat, status: seat.status === 'selected' ? 'available' : 'selected' }
      }
      if (seat.status === 'selected') {
        return { ...seat, status: 'available' }
      }
      return seat
    }))
  }

  return (
    <div className="bg-surface min-h-screen pb-48">
      {/* Top App Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="flex justify-between items-center w-full px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Icon name="cloud" className="text-primary" />
            <span className="text-2xl font-black italic tracking-tighter text-primary">SkyBooker</span>
          </Link>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy5rUTU2nAIHzjwtBeUKKThEI4f3FdabWcI4tCRu1OWfhV11Qq_Kqz4BF80lKR3i7tzYXrvCF7U53RAPku-tv49nNAkr2a69YCcxWSwpjnJAEG4YeO_d3sL_1_f5fNpPGjPnGRM1XvSLlc1njT2757a-gcgkadwpM1sYhj1PJhjEfiEn4fvMWjhFmrsRwkIgl3Yx4TMaIJpuBeg_0srp9pU3lr3d5914mQpm-QpVlchQOjwj8-1mbNuEODDTyW2nIGAX3VQoYtX0s"
              alt="User avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-8 px-4 flex flex-col items-center">
        {/* Trip Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md bg-surface-container-lowest rounded-[2rem] p-6 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-outline-variant/10"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-bold text-xl tracking-tight text-primary">Select Seat</h1>
              <p className="text-sm text-muted-foreground font-medium">Flight SB-442 • Economy Class</p>
            </div>
            <div className="text-right">
              <span className="block text-xs uppercase tracking-[0.05em] font-bold text-muted-foreground">BOM → LHR</span>
              <span className="text-primary font-black">Gate 4A</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-around items-center pt-4 border-t border-surface-container-low">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest border border-outline-variant/20" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Icon name="check" className="text-[14px] text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Selected</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest/50 flex items-center justify-center grayscale">
                <Icon name="close" className="text-[14px] text-muted-foreground/50" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Booked</span>
            </div>
          </div>
        </motion.div>

        {/* Airplane Seat Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md bg-surface-container-lowest rounded-t-[5rem] pt-16 pb-32 shadow-2xl"
        >
          {/* Cockpit Illusion */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-48 h-24 bg-surface-container-lowest rounded-t-full flex items-center justify-center overflow-hidden">
            <div className="w-full h-full opacity-10" style={{ background: 'radial-gradient(circle at center, #00236f, transparent)' }} />
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col gap-8 px-8">
            {/* Column Labels */}
            <div className="flex justify-between items-center text-muted-foreground font-bold text-xs tracking-widest px-2">
              <span className="w-10 text-center">A</span>
              <span className="w-10 text-center">B</span>
              <div className="w-12" />
              <span className="w-10 text-center">C</span>
              <span className="w-10 text-center">D</span>
            </div>

            {/* Seat Rows */}
            <div className="flex flex-col gap-6">
              {[12, 13, 14, 15, 16, 17].map((row, rowIndex) => (
                <div key={row}>
                  {/* Exit Row Indicator */}
                  {row === 15 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-4 py-4 mb-6"
                    >
                      <div className="h-[1px] flex-grow bg-outline-variant/20" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-destructive flex items-center gap-1">
                        <Icon name="exit_to_app" className="text-[12px]" />
                        Emergency Exit
                      </span>
                      <div className="h-[1px] flex-grow bg-outline-variant/20" />
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + rowIndex * 0.05 }}
                    className="flex justify-between items-center"
                  >
                    <div className="flex gap-2">
                      {['A', 'B'].map(col => {
                        const seat = seats.find(s => s.row === row && s.col === col)
                        return (
                          <SeatButton
                            key={`${row}${col}`}
                            seat={seat!}
                            onClick={() => handleSeatClick(`${row}${col}`)}
                          />
                        )
                      })}
                    </div>
                    <span className={`text-[10px] font-black ${selectedSeat?.row === row ? 'text-primary' : 'text-muted-foreground/40'}`}>
                      {row}
                    </span>
                    <div className="flex gap-2">
                      {['C', 'D'].map(col => {
                        const seat = seats.find(s => s.row === row && s.col === col)
                        return (
                          <SeatButton
                            key={`${row}${col}`}
                            seat={seat!}
                            onClick={() => handleSeatClick(`${row}${col}`)}
                          />
                        )
                      })}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom Selection Bar */}
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl px-6 pt-5 pb-10 shadow-[0_-10px_50px_rgba(0,35,111,0.1)] rounded-t-3xl"
      >
        <div className="flex items-center justify-between gap-6 max-w-md mx-auto">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selected Seat</span>
              {selectedSeat && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black">
                  {selectedSeat.id}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">
                ₹{selectedSeat?.price?.toLocaleString() || '0'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">+ taxes</span>
            </div>
          </div>
          <Link to="/booking/details">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedSeat}
              className="flex-shrink-0 h-14 px-8 primary-gradient text-primary-foreground rounded-full font-bold shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
            >
              Continue
              <Icon name="arrow_forward" />
            </motion.button>
          </Link>
        </div>
      </motion.footer>

      {/* Background Decoration */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full blur-[120px] bg-primary/10" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-[100px] bg-secondary/10" />
      </div>
    </div>
  )
}

function SeatButton({ seat, onClick }: { seat: Seat; onClick: () => void }) {
  return (
    <motion.button
      whileHover={seat.status !== 'booked' ? { scale: 1.1 } : undefined}
      whileTap={seat.status !== 'booked' ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={seat.status === 'booked'}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
        seat.status === 'selected'
          ? 'bg-primary shadow-lg shadow-primary/20 scale-105'
          : seat.status === 'booked'
          ? 'bg-surface-container-highest/50 cursor-not-allowed'
          : 'bg-surface-container-highest hover:bg-surface-container-high'
      }`}
    >
      {seat.status === 'selected' && (
        <Icon name="chair" className="text-white text-sm" />
      )}
      {seat.status === 'booked' && (
        <Icon name="close" className="text-muted-foreground/30 text-sm" />
      )}
    </motion.button>
  )
}

