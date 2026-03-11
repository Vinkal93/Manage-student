import { useMemo, useState, useEffect } from 'react';
import { getSessions } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { Activity, Users, Monitor, Clock, Search, Globe, Smartphone, Eye, RefreshCw } from 'lucide-react';

function parseUserAgent(ua: string) {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edge/i.test(ua);
  const isFirefox = /firefox/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
  const isEdge = /edge|edg/i.test(ua);
  let browser = 'Other';
  if (isChrome) browser = 'Chrome';
  else if (isFirefox) browser = 'Firefox';
  else if (isSafari) browser = 'Safari';
  else if (isEdge) browser = 'Edge';
  
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  
  return { isMobile, browser, os, device: isMobile ? '📱 Mobile' : '💻 Desktop' };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Analytics() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const sessions = useMemo(() => {
    const all = getSessions();
    return all.sort((a: any, b: any) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
  }, [refreshKey]);

  // Auto refresh every 10s
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let data = sessions;
    if (filter === 'student') data = data.filter((s: any) => s.role === 'student');
    if (filter === 'admin') data = data.filter((s: any) => s.role === 'admin');
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((s: any) => s.userName?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q));
    }
    return data;
  }, [sessions, filter, search]);

  // Active sessions (last 15 mins)
  const activeSessions = sessions.filter((s: any) => {
    const diff = Date.now() - new Date(s.lastActivity).getTime();
    return diff < 15 * 60 * 1000;
  });

  const studentSessions = sessions.filter((s: any) => s.role === 'student');
  const todaySessions = sessions.filter((s: any) => new Date(s.loginTime).toDateString() === new Date().toDateString());
  const uniqueDevices = new Set(sessions.map((s: any) => s.device)).size;

  // Device stats
  const deviceStats = sessions.reduce((acc: any, s: any) => {
    const { device } = parseUserAgent(s.device || '');
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const browserStats = sessions.reduce((acc: any, s: any) => {
    const { browser } = parseUserAgent(s.device || '');
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time student login & activity tracking</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Now" value={activeSessions.length} icon={Activity} variant="success" />
        <StatCard title="Today Logins" value={todaySessions.length} icon={Users} variant="primary" />
        <StatCard title="Student Logins" value={studentSessions.length} icon={Users} variant="accent" />
        <StatCard title="Unique Devices" value={uniqueDevices} icon={Monitor} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Activity size={16} className="text-success" /> Active Users
                <Badge variant="default" className="text-xs ml-2">{activeSessions.length} online</Badge>
              </h3>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {activeSessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No active users right now</div>
              ) : (
                activeSessions.map((s: any) => {
                  const ua = parseUserAgent(s.device || '');
                  return (
                    <div key={s.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{s.userName}</p>
                          <p className="text-xs text-muted-foreground">{s.studentId || 'Admin'} • {s.currentPage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{ua.device} {ua.browser}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(s.lastActivity)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* All Sessions */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold text-foreground">Login History</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                  <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-8 text-xs w-40" />
                </div>
                <div className="flex bg-muted rounded-md p-0.5 gap-0.5">
                  {(['all', 'student', 'admin'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${filter === f ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {f === 'all' ? 'All' : f === 'student' ? 'Students' : 'Admin'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">Device</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Browser</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Screen</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Page</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((s: any, i: number) => {
                    const ua = parseUserAgent(s.device || '');
                    const isActive = Date.now() - new Date(s.lastActivity).getTime() < 15 * 60 * 1000;
                    return (
                      <tr key={`${s.id}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
                            <div>
                              <p className="font-medium text-foreground text-xs">{s.userName}</p>
                              <p className="text-xs text-muted-foreground">{s.studentId || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3"><Badge variant={s.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{s.role}</Badge></td>
                        <td className="p-3 hidden sm:table-cell text-xs text-muted-foreground">{ua.device}</td>
                        <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{ua.browser} / {ua.os}</td>
                        <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{s.screenSize}</td>
                        <td className="p-3 text-xs text-muted-foreground">{s.currentPage}</td>
                        <td className="p-3 text-xs text-muted-foreground">{timeAgo(s.loginTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Smartphone size={14} /> Device Types</h3>
            {Object.entries(deviceStats).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{device}</span>
                <Badge variant="secondary" className="text-xs">{count as number}</Badge>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Globe size={14} /> Browsers</h3>
            {Object.entries(browserStats).map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{browser}</span>
                <Badge variant="secondary" className="text-xs">{count as number}</Badge>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Clock size={14} /> Recent Activity</h3>
            {sessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{s.userName}</span> logged in {timeAgo(s.loginTime)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
