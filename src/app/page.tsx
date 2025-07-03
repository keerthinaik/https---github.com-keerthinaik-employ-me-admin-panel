import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Total Users",
    value: "12,405",
    icon: Users,
    description: "+15% from last month",
    link: "/users"
  },
  {
    title: "Total Jobs Posted",
    value: "8,721",
    icon: Briefcase,
    description: "+21% from last month",
    link: "/jobs"
  },
  {
    title: "Pending Approvals",
    value: "37",
    icon: Clock,
    description: "Awaiting review",
    link: "/jobs"
  },
  {
    title: "Approved This Month",
    value: "1,289",
    icon: CheckCircle,
    description: "Jobs gone live",
    link: "/jobs"
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Button variant="link" asChild className="p-0 h-auto mt-2">
                 <Link href={stat.link}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
               <CardDescription>Perform common tasks with a single click.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
               <Button asChild><Link href="/users">Manage Users</Link></Button>
               <Button asChild variant="secondary"><Link href="/jobs">Review Jobs</Link></Button>
               <Button asChild variant="secondary"><Link href="/roles">Assign Roles</Link></Button>
               <Button asChild variant="secondary"><Link href="/moderation">Moderate Content</Link></Button>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
               <CardTitle>Recent Activity</CardTitle>
               <CardDescription>A log of recent admin actions.</CardDescription>
            </CardHeader>
            <CardContent>
               <ul className="space-y-3 text-sm">
                  <li><span className="font-medium">Admin User</span> approved job post <span className="text-primary">"Senior React Developer"</span>.</li>
                  <li><span className="font-medium">Admin User</span> disabled user <span className="text-primary">"spammer@example.com"</span>.</li>
                  <li><span className="font-medium">Editor Jane</span> changed role of <span className="text-primary">"newbie@example.com"</span> to Viewer.</li>
                  <li><span className="font-medium">Admin User</span> added a new localization string for French.</li>
               </ul>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
