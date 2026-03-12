import { useMemo, useState, useEffect } from 'react';
import { getSessions } from '@/lib/auth';
import { getStudents } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import {
  Activity, Users, Monitor, Clock, Search, Globe, Smartphone, RefreshCw,
  Filter, X, TrendingUp, Eye, Calendar, MapPin, Layers, ArrowUpRight
} from 'lucide-react';

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

  return { isMobile, browser, os, device: isMobile ? 'Mobile' : 'Desktop' };
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

const COLORS = ['hsl(215,80%,28%)', 'hsl(172,60%,40%)', 'hsl(145,60%,40%)', 'hsl(38,90%,55%)', 'hsl(0,72%,55%)', 'hsl(270,60%,50%)'];

export default function Analytics() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [browserFilter, setBrowserFilter] = useState('all');
  const [osFilter, setOsFilter] = useState('all');
  const [tab, setTab] = useState<'overview' | 'sessions' | 'devices' | 'pages'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const sessions = useMemo(() => {
    const all = getSessions();
    return all.sort((a: any, b: any) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
  }, [refreshKey]);

  const students = useMemo(() => getStudents(), []);

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
    if (dateFilter !== 'all') {
      const now = Date.now();
      data = data.filter((s: any) => {
        const t = new Date(s.loginTime).getTime();
        if (dateFilter === 'today') return now - t < 86400000;
        if (dateFilter === 'week') return now - t < 7 * 86400000;
        if (dateFilter === 'month') return now - t < 30 * 86400000;
        return true;
      });
    }
    if (deviceFilter !== 'all') {
      data = data.filter((s: any) => {
        const { isMobile } = parseUserAgent(s.device || '');
        return deviceFilter === 'mobile' ? isMobile : !isMobile;
      });
    }
    if (browserFilter !== 'all') {
      data = data.filter((s: any) => parseUserAgent(s.device || '').browser === browserFilter);
    }
    if (osFilter !== 'all') {
      data = data.filter((s: any) => parseUserAgent(s.device || '').os === osFilter);
    }
    return data;
  }, [sessions, filter, search, dateFilter, deviceFilter, browserFilter, osFilter]);

  const activeSessions = sessions.filter((s: any) => Date.now() - new Date(s.lastActivity).getTime() < 15 * 60 * 1000);
  const studentSessions = sessions.filter((s: any) => s.role === 'student');
  const todaySessions = sessions.filter((s: any) => new Date(s.loginTime).toDateString() === new Date().toDateString());
  const uniqueDevices = new Set(sessions.map((s: any) => s.device)).size;
  const weekSessions = sessions.filter((s: any) => Date.now() - new Date(s.loginTime).getTime() < 7 * 86400000);

  // Charts data
  const deviceStats = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const d = parseUserAgent(s.device || '').device;
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const browserStats = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const b = parseUserAgent(s.device || '').browser;
      map[b] = (map[b] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const osStats = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const o = parseUserAgent(s.device || '').os;
      map[o] = (map[o] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const pageStats = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const p = s.currentPage || '/';
      map[p] = (map[p] || 0) + 1;
    });
    return Object.entries(map).map(([page, visits]) => ({ page, visits })).sort((a, b) => b.visits - a.visits).slice(0, 10);
  }, [sessions]);

  const dailyLogins = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const day = new Date(s.loginTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([day, count]) => ({ day, logins: count })).slice(-14);
  }, [sessions]);

  const hourlyActivity = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    sessions.forEach((s: any) => {
      const h = new Date(s.loginTime).getHours();
      hours[h].count++;
    });
    return hours;
  }, [sessions]);

  const allBrowsers: string[] = [...new Set(sessions.map((s: any) => parseUserAgent(s.device || '').browser))] as string[];
  const allOS: string[] = [...new Set(sessions.map((s: any) => parseUserAgent(s.device || '').os))] as string[];

  const hasFilters = filter !== 'all' || dateFilter !== 'all' || deviceFilter !== 'all' || browserFilter !== 'all' || osFilter !== 'all' || search;
  const clearFilters = () => {
    setFilter('all'); setDateFilter('all'); setDeviceFilter('all');
    setBrowserFilter('all'); setOsFilter('all'); setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Deep analysis of student activity, devices & engagement</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Active Now" value={activeSessions.length} icon={Activity} variant="success" />
        <StatCard title="Today" value={todaySessions.length} icon={Calendar} variant="primary" />
        <StatCard title="This Week" value={weekSessions.length} icon={TrendingUp} variant="accent" />
        <StatCard title="Students" value={studentSessions.length} icon={Users} variant="primary" />
        <StatCard title="Devices" value={uniqueDevices} icon={Monitor} variant="warning" />
        <StatCard title="Total" value={sessions.length} icon={Layers} variant="accent" />
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        {(['overview', 'sessions', 'devices', 'pages'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Filter size={14} /> Advanced Filters</h3>
          {hasFilters && <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={clearFilters}><X size={12} /> Clear</Button>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input placeholder="Search user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deviceFilter} onValueChange={(v: any) => setDeviceFilter(v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Device" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">📱 Mobile</SelectItem>
              <SelectItem value="desktop">💻 Desktop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={browserFilter} onValueChange={setBrowserFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Browser" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Browsers</SelectItem>
              {allBrowsers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={osFilter} onValueChange={setOsFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="OS" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OS</SelectItem>
              {allOS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground">Showing {filtered.length} of {sessions.length} sessions</div>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Logins Chart */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp size={16} /> Daily Login Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyLogins}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="logins" stroke="hsl(215,80%,28%)" fill="hsl(215,80%,28%)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Activity */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Clock size={16} /> Hourly Activity Pattern</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(172,60%,40%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Active Users Live */}
          <div className="bg-card rounded-xl border border-border shadow-sm lg:col-span-2">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Activity size={16} className="text-success" /> Live Active Users
                <Badge variant="default" className="text-xs ml-2">{activeSessions.length} online</Badge>
              </h3>
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {activeSessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No active users right now</div>
              ) : (
                activeSessions.map((s: any) => {
                  const ua = parseUserAgent(s.device || '');
                  const student = students.find(st => st.studentId === s.studentId);
                  return (
                    <div key={s.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{s.userName}</p>
                          <p className="text-xs text-muted-foreground">{s.studentId || 'Admin'} • {student?.course || ''} • {s.currentPage}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs text-muted-foreground">{ua.device} • {ua.browser} • {ua.os}</p>
                        <p className="text-xs text-muted-foreground">{s.screenSize} • {timeAgo(s.lastActivity)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Role</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">Device</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Browser / OS</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Screen</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden lg:table-cell">Language</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Page</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((s: any, i: number) => {
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
                      <td className="p-3 hidden sm:table-cell text-xs text-muted-foreground">{ua.device === 'Mobile' ? '📱' : '💻'} {ua.device}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{ua.browser} / {ua.os}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{s.screenSize}</td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{s.language}</td>
                      <td className="p-3 text-xs text-muted-foreground">{s.currentPage}</td>
                      <td className="p-3 text-xs text-muted-foreground">{timeAgo(s.loginTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'devices' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4"><Smartphone size={14} /> Device Types</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {deviceStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4"><Globe size={14} /> Browsers</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={browserStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {browserStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4"><Monitor size={14} /> Operating Systems</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={osStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {osStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Screen sizes breakdown */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:col-span-3">
            <h3 className="font-semibold text-foreground text-sm mb-4">Screen Size Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(
                sessions.reduce((acc: Record<string, number>, s: any) => {
                  const size = s.screenSize || 'Unknown';
                  acc[size] = (acc[size] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([size, count]) => (
                <div key={size} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs font-mono text-foreground">{size}</p>
                  <p className="text-lg font-bold text-primary">{count as number}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2"><Eye size={14} /> Most Visited Pages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="visits" fill="hsl(215,80%,28%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground text-sm mb-4">Page Visit Details</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pageStats.map((p, i) => (
                <div key={p.page} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary w-6">{i + 1}</span>
                    <span className="text-sm text-foreground font-mono">{p.page}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{p.visits} visits</Badge>
                    <ArrowUpRight size={12} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 lg:col-span-2">
            <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2"><Clock size={14} /> Recent Activity Timeline</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filtered.slice(0, 20).map((s: any) => {
                const ua = parseUserAgent(s.device || '');
                return (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {s.role === 'admin' ? '🛡️' : '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground"><strong>{s.userName}</strong> visited <span className="font-mono text-xs text-primary">{s.currentPage}</span></p>
                      <p className="text-xs text-muted-foreground">{ua.device} • {ua.browser} • {s.screenSize} • {timeAgo(s.loginTime)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}