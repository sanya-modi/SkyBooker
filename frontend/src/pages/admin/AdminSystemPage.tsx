// export { default } from '../../app/admin/system/page'
import { motion } from "framer-motion"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const systemStatus = {
  api: { status: "Operational", uptime: "99.98%", latency: "45ms" },
  database: { status: "Operational", uptime: "99.99%", connections: 142 },
  cache: { status: "Operational", hitRate: "94.5%", memory: "2.3 GB" },
  queue: { status: "Warning", pending: 1234, processing: 45 },
}

const maintenanceTasks = [
  { name: "Database Backup", lastRun: "2 hours ago", nextRun: "In 10 hours", status: "Completed" },
  { name: "Cache Purge", lastRun: "1 day ago", nextRun: "In 6 hours", status: "Scheduled" },
  { name: "Log Rotation", lastRun: "3 days ago", nextRun: "Tomorrow", status: "Scheduled" },
  { name: "Index Optimization", lastRun: "1 week ago", nextRun: "In 6 days", status: "Scheduled" },
]

export default function SystemTools() {
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
          <h1 className="text-2xl font-bold text-sky-text">System Tools</h1>
          <p className="text-sky-text-light">Monitor and manage system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-sky-border">
            <Icon name="refresh" className="mr-2" />
            Refresh
          </Button>
          <Button className="bg-sky-primary hover:bg-sky-primary/90">
            <Icon name="terminal" className="mr-2" />
            Run Diagnostics
          </Button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="api" className="text-sky-primary" />
                <span className="font-medium text-sky-text">API Server</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                <Icon name="check_circle" className="text-xs mr-1" />
                {systemStatus.api.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-sky-text-light">Uptime</span>
                <span className="text-sky-text">{systemStatus.api.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-text-light">Latency</span>
                <span className="text-sky-text">{systemStatus.api.latency}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="database" className="text-sky-primary" />
                <span className="font-medium text-sky-text">Database</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                <Icon name="check_circle" className="text-xs mr-1" />
                {systemStatus.database.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-sky-text-light">Uptime</span>
                <span className="text-sky-text">{systemStatus.database.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-text-light">Connections</span>
                <span className="text-sky-text">{systemStatus.database.connections}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="memory" className="text-sky-primary" />
                <span className="font-medium text-sky-text">Cache</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                <Icon name="check_circle" className="text-xs mr-1" />
                {systemStatus.cache.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-sky-text-light">Hit Rate</span>
                <span className="text-sky-text">{systemStatus.cache.hitRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-text-light">Memory</span>
                <span className="text-sky-text">{systemStatus.cache.memory}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="queue" className="text-sky-primary" />
                <span className="font-medium text-sky-text">Job Queue</span>
              </div>
              <Badge className="bg-amber-100 text-amber-700">
                <Icon name="warning" className="text-xs mr-1" />
                {systemStatus.queue.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-sky-text-light">Pending</span>
                <span className="text-sky-text">{systemStatus.queue.pending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-text-light">Processing</span>
                <span className="text-sky-text">{systemStatus.queue.processing}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="monitoring" className="text-sky-primary" />
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-sky-text">CPU Usage</span>
                  <span className="text-sm text-sky-text">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-sky-text">Memory Usage</span>
                  <span className="text-sm text-sky-text">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-sky-text">Disk Usage</span>
                  <span className="text-sm text-sky-text">52%</span>
                </div>
                <Progress value={52} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-sky-text">Network I/O</span>
                  <span className="text-sm text-sky-text">23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Flags */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="toggle_on" className="text-sky-primary" />
                Feature Flags
              </CardTitle>
              <CardDescription>Enable or disable system features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-sky-bg rounded-lg">
                <div>
                  <p className="font-medium text-sky-text">Maintenance Mode</p>
                  <p className="text-sm text-sky-text-light">Show maintenance page to users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-bg rounded-lg">
                <div>
                  <p className="font-medium text-sky-text">New Booking System</p>
                  <p className="text-sm text-sky-text-light">Enable v2 booking flow</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-bg rounded-lg">
                <div>
                  <p className="font-medium text-sky-text">API Rate Limiting</p>
                  <p className="text-sm text-sky-text-light">Enforce request limits</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-bg rounded-lg">
                <div>
                  <p className="font-medium text-sky-text">Debug Logging</p>
                  <p className="text-sm text-sky-text-light">Enable verbose logging</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance Tasks */}
      <motion.div variants={fadeInUp}>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="build" className="text-sky-primary" />
              Scheduled Maintenance
            </CardTitle>
            <Button variant="outline" className="border-sky-border">
              <Icon name="add" className="mr-2" />
              Schedule Task
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sky-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Task</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Last Run</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Next Run</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-sky-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceTasks.map((task, index) => (
                    <motion.tr
                      key={task.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-sky-border last:border-0 hover:bg-sky-bg"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="schedule" className="text-sky-primary" />
                          </div>
                          <span className="font-medium text-sky-text">{task.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sky-text-light">{task.lastRun}</td>
                      <td className="py-3 px-4 text-sky-text">{task.nextRun}</td>
                      <td className="py-3 px-4">
                        <Badge className={task.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Icon name="play_arrow" className="mr-1" />
                            Run Now
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icon name="more_vert" className="text-sky-text-light" />
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
      </motion.div>
    </motion.div>
  )
}

