import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightApi, type PopularDestination } from '../../services/api'

export function PopularDestinations() {
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const data = await flightApi.getPopularDestinations()
        console.log("API response:", data)
        // Limit to 6 cards
        setDestinations(data.slice(0, 6))
      } catch (error) {
        console.error('Failed to fetch popular destinations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDestinations()
  }, [])

  function handleDestinationClick(dest: PopularDestination) {
    // Redirect to /results?to=<airportCode>&destinationOnly=true
    navigate(`/results?to=${dest.airportCode}&destinationOnly=true`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (destinations.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Trending Now</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Popular Destinations</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest, index) => (
          <motion.div
            key={dest.airportCode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[16/9] bg-slate-200"
            onClick={() => handleDestinationClick(dest)}
          >
            <img
              src={dest.imageUrl || `https://images.unsplash.com/featured/800x600/?${dest.destinationName.replace(' ', '')},landscape`}
              alt={dest.destinationName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
  (e.target as HTMLImageElement).src =
    `https://source.unsplash.com/400x300/?${dest.destinationName.replaceAll(' ', '+')},travel`
}}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <p className="text-xs font-medium text-blue-300 mb-1">{dest.airportCode}</p>
              <h3 className="text-2xl font-bold">{dest.destinationName}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
