import { PageHeader } from "@/components/shared/page-header"
import { StatGrid, StatCard } from "@/components/shared/stat-card"
import { SectionCard } from "@/components/shared/section-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PersonCell } from "@/components/shared/user-avatar"
import { Meter } from "@/components/shared/meter"
import { ANNOUNCEMENTS, CHANNEL_STATS } from "@/lib/mock/operations"
import { Megaphone, CheckCircle2, RadioTower, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber, formatPercent, formatDate } from "@/lib/format"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Communication & Notifications | EduSphere",
}

export default function CommunicationPage() {
  const totalSent = CHANNEL_STATS.reduce((acc, curr) => acc + curr.sent, 0)
  const totalDelivered = CHANNEL_STATS.reduce((acc, curr) => acc + curr.delivered, 0)
  const deliveryRate = totalSent > 0 ? totalDelivered / totalSent : 0
  const scheduledCount = ANNOUNCEMENTS.filter(a => a.status === "Scheduled").length
  const activeChannels = CHANNEL_STATS.length

  const headerActions = (
    <Button>+ New Announcement</Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication & Notifications"
        actions={headerActions}
      />

      <StatGrid>
        <StatCard label="Total Sent" value={formatNumber(totalSent)} icon={Megaphone} />
        <StatCard label="Delivery Rate" value={formatPercent(deliveryRate)} icon={CheckCircle2} />
        <StatCard label="Active Channels" value={activeChannels.toString()} icon={RadioTower} />
        <StatCard label="Scheduled" value={scheduledCount.toString()} icon={Clock} />
      </StatGrid>

      <SectionCard title="Announcements">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ANNOUNCEMENTS.map(announcement => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{announcement.audience}</Badge>
                  <StatusBadge status={announcement.status} />
                </div>
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
                <CardDescription>
                  {formatDate(announcement.publishedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.body}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {announcement.channels.map((channel: string) => (
                    <Badge key={channel} variant="outline" className="text-xs">{channel}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <PersonCell name={announcement.author} subtitle="Author" />
                <div className="text-xs text-muted-foreground">
                  Reach: <span className="font-medium text-foreground">{formatNumber(announcement.reach)}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Channel Performance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHANNEL_STATS.map(stat => {
            const rate = stat.sent > 0 ? (stat.delivered / stat.sent) * 100 : 0
            return (
              <Card key={stat.channel}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{stat.channel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sent</span>
                    <span className="font-medium">{formatNumber(stat.sent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivered</span>
                    <span className="font-medium">{formatNumber(stat.delivered)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">{formatPercent(rate/100)}</span>
                    </div>
                    <Meter value={rate} tone={rate > 90 ? "success" : rate > 75 ? "warning" : "danger"} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
