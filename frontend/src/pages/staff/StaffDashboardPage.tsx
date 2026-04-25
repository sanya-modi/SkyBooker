// export { default } from '../../app/staff/page'
import { motion } from "framer-motion"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const stats = [
  { icon: "flight_takeoff", label: "Today's Departures", value: "42", change: "+5 from yesterday", color: "text-sky-primary" },
  { icon: "flight_land", label: "Today's Arrivals", value: "38", change: "+3 from yesterday", color: "text-emerald-500" },
  { icon: "groups", label: "Passengers Today", value: "12,450", change: "85% check-in rate", color: "text-amber-500" },
  { icon: "event_busy", label: "Delayed Flights", value: "3", change: "-2 from yesterday", color: "text-red-500" },
]

const upcomingFlights = [
  { flight: "SK 401", route: "LHR → JFK", time: "14:30", gate: "A12", status: "Boarding", statusColor: "bg-emerald-100 text-emerald-700" },
  { flight: "SK 205", route: "LHR → CDG", time: "15:00", gate: "B08", status: "On Time", statusColor: "bg-sky-100 text-sky-700" },
  { flight: "SK 712", route: "LHR → DXB", time: "15:45", gate: "C15", status: "Delayed", statusColor: "bg-red-100 text-red-700" },
  { flight: "SK 890", route: "LHR → SIN", time: "16:15", gate: "D22", status: "On Time", statusColor: "bg-sky-100 text-sky-700" },
]

const recentBookings = [
  { id: "SKY-89234", passenger: "John Smith", flight: "SK 401", class: "Business", status: "Confirmed" },
  { id: "SKY-89235", passenger: "Emma Wilson", flight: "SK 205", class: "Economy", status: "Checked In" },
  { id: "SKY-89236", passenger: "Michael Brown", flight: "SK 712", class: "First", status: "Pending" },
]

export default function StaffDashboard() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-text">Staff Dashboard</h1>
          <p className="text-sky-text-light">Welcome back, Sarah. Here&apos;s your overview for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-sky-border">
            <Icon name="download" className="mr-2" />
            Export
          </Button>
          <Button className="bg-sky-primary hover:bg-sky-primary/90">
            <Icon name="add" className="mr-2" />
            New Booking
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    <Icon name={stat.icon} className={`text-2xl ${stat.color}`} />
                  </div>
                  <Icon name="trending_up" className="text-emerald-500" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-sky-text">{stat.value}</p>
                  <p className="text-sm text-sky-text-light">{stat.label}</p>
                  <p className="text-xs text-sky-text-light mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Flights */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="schedule" className="text-sky-primary" />
                Upcoming Flights
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-sky-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingFlights.map((flight, index) => (
                  <motion.div
                    key={flight.flight}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-sky-bg rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="flight" className="text-sky-primary text-2xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-sky-text">{flight.flight}</p>
                        <p className="text-sm text-sky-text-light">{flight.route}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sky-text">{flight.time}</p>
                      <p className="text-sm text-sky-text-light">Gate {flight.gate}</p>
                    </div>
                    <Badge className={flight.statusColor}>{flight.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <Icon name="more_vert" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Stats */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="bolt" className="text-sky-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-sky-primary hover:bg-sky-primary/90">
                <Icon name="how_to_reg" className="mr-2" />
                Check-In Passenger
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="search" className="mr-2" />
                Search Booking
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="edit_calendar" className="mr-2" />
                Modify Flight
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="support_agent" className="mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Check-In Progress */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="donut_large" className="text-sky-primary" />
                Check-In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-text-light">SK 401 - LHR → JFK</span>
                  <span className="font-medium text-sky-text">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-text-light">SK 205 - LHR → CDG</span>
                  <span className="font-medium text-sky-text">62%</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-text-light">SK 712 - LHR → DXB</span>
                  <span className="font-medium text-sky-text">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div variants={fadeInUp}>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="receipt_long" className="text-sky-primary" />
              Recent Bookings
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-sky-primary">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sky-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Booking ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Passenger</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Flight</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Class</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-sky-border last:border-0 hover:bg-sky-bg"
                    >
                      <td className="py-3 px-4 font-medium text-sky-primary">{booking.id}</td>
                      <td className="py-3 px-4 text-sky-text">{booking.passenger}</td>
                      <td className="py-3 px-4 text-sky-text">{booking.flight}</td>
                      <td className="py-3 px-4 text-sky-text">{booking.class}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            booking.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.status === "Checked In"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <Icon name="visibility" className="mr-1" />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

