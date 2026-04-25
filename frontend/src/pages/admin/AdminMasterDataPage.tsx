// export { default } from '../../app/admin/master-data/page'
import { useState } from "react"
import { motion } from "framer-motion"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const airports = [
  { code: "LHR", name: "London Heathrow", city: "London", country: "United Kingdom", terminals: 5, status: "Active" },
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "United States", terminals: 6, status: "Active" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "UAE", terminals: 3, status: "Active" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", terminals: 3, status: "Active" },
  { code: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore", terminals: 4, status: "Active" },
]

const aircraft = [
  { code: "A380", name: "Airbus A380", capacity: 525, range: "15,200 km", units: 12, status: "Active" },
  { code: "B787", name: "Boeing 787 Dreamliner", capacity: 296, range: "14,140 km", units: 18, status: "Active" },
  { code: "A350", name: "Airbus A350", capacity: 366, range: "15,000 km", units: 15, status: "Active" },
  { code: "B777", name: "Boeing 777", capacity: 368, range: "11,135 km", units: 22, status: "Active" },
  { code: "A320", name: "Airbus A320", capacity: 180, range: "6,150 km", units: 35, status: "Active" },
]

const routes = [
  { id: "RT001", origin: "LHR", destination: "JFK", distance: "5,555 km", frequency: "3x daily", status: "Active" },
  { id: "RT002", origin: "LHR", destination: "DXB", distance: "5,500 km", frequency: "4x daily", status: "Active" },
  { id: "RT003", origin: "CDG", destination: "SIN", distance: "10,740 km", frequency: "2x daily", status: "Active" },
  { id: "RT004", origin: "JFK", destination: "DXB", distance: "11,010 km", frequency: "1x daily", status: "Active" },
]

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("airports")

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-text">Master Data</h1>
          <p className="text-sky-text-light">Manage airports, aircraft, and routes</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="airports" className="data-[state=active]:bg-sky-primary data-[state=active]:text-white">
              <Icon name="flight_takeoff" className="mr-2" />
              Airports
            </TabsTrigger>
            <TabsTrigger value="aircraft" className="data-[state=active]:bg-sky-primary data-[state=active]:text-white">
              <Icon name="airlines" className="mr-2" />
              Aircraft
            </TabsTrigger>
            <TabsTrigger value="routes" className="data-[state=active]:bg-sky-primary data-[state=active]:text-white">
              <Icon name="route" className="mr-2" />
              Routes
            </TabsTrigger>
          </TabsList>

          {/* Airports Tab */}
          <TabsContent value="airports" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="location_city" className="text-sky-primary" />
                  Airport Database
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-text-light" />
                    <Input placeholder="Search airports..." className="pl-10 w-64" />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-sky-primary hover:bg-sky-primary/90">
                        <Icon name="add" className="mr-2" />
                        Add Airport
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Airport</DialogTitle>
                        <DialogDescription>Add a new airport to the database</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Airport Code</label>
                            <Input placeholder="LHR" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Terminals</label>
                            <Input type="number" placeholder="5" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Airport Name</label>
                          <Input placeholder="London Heathrow" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input placeholder="London" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <Input placeholder="United Kingdom" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button className="bg-sky-primary hover:bg-sky-primary/90">Add Airport</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sky-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Code</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Airport Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">City</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Country</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Terminals</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {airports.map((airport, index) => (
                        <motion.tr
                          key={airport.code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-sky-border last:border-0 hover:bg-sky-bg"
                        >
                          <td className="py-3 px-4 font-medium text-sky-primary">{airport.code}</td>
                          <td className="py-3 px-4 text-sky-text">{airport.name}</td>
                          <td className="py-3 px-4 text-sky-text">{airport.city}</td>
                          <td className="py-3 px-4 text-sky-text-light">{airport.country}</td>
                          <td className="py-3 px-4 text-sky-text">{airport.terminals}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-emerald-100 text-emerald-700">{airport.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon">
                                <Icon name="edit" className="text-sky-text-light" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Icon name="delete" className="text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aircraft Tab */}
          <TabsContent value="aircraft" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="airlines" className="text-sky-primary" />
                  Aircraft Fleet
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-text-light" />
                    <Input placeholder="Search aircraft..." className="pl-10 w-64" />
                  </div>
                  <Button className="bg-sky-primary hover:bg-sky-primary/90">
                    <Icon name="add" className="mr-2" />
                    Add Aircraft
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sky-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Code</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Aircraft Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Capacity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Range</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Units</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aircraft.map((plane, index) => (
                        <motion.tr
                          key={plane.code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-sky-border last:border-0 hover:bg-sky-bg"
                        >
                          <td className="py-3 px-4 font-medium text-sky-primary">{plane.code}</td>
                          <td className="py-3 px-4 text-sky-text">{plane.name}</td>
                          <td className="py-3 px-4 text-sky-text">{plane.capacity} pax</td>
                          <td className="py-3 px-4 text-sky-text-light">{plane.range}</td>
                          <td className="py-3 px-4 text-sky-text">{plane.units}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-emerald-100 text-emerald-700">{plane.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon">
                                <Icon name="edit" className="text-sky-text-light" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Icon name="delete" className="text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="connecting_airports" className="text-sky-primary" />
                  Flight Routes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-text-light" />
                    <Input placeholder="Search routes..." className="pl-10 w-64" />
                  </div>
                  <Button className="bg-sky-primary hover:bg-sky-primary/90">
                    <Icon name="add" className="mr-2" />
                    Add Route
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sky-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Route ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Origin</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Destination</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Distance</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Frequency</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route, index) => (
                        <motion.tr
                          key={route.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-sky-border last:border-0 hover:bg-sky-bg"
                        >
                          <td className="py-3 px-4 font-medium text-sky-primary">{route.id}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{route.origin}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{route.destination}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sky-text-light">{route.distance}</td>
                          <td className="py-3 px-4 text-sky-text">{route.frequency}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-emerald-100 text-emerald-700">{route.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon">
                                <Icon name="edit" className="text-sky-text-light" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Icon name="delete" className="text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

