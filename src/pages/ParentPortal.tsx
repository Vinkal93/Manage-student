import { useState, useMemo } from 'react';
import { getStudents } from '@/lib/store';
import { getSettings } from '@/lib/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { GraduationCap, CreditCard, ClipboardList, TrendingUp, User, Lock, ArrowLeft } from 'lucide-react';

export default function ParentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [parentId, setParentId] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const settings = getSettings();

  const student = useMemo(() => {
    if (!loggedIn || !studentId) return null;
    return getStudents().find(s => s.studentId === studentId);
  }, [loggedIn, studentId]);

  const handleLogin = () => {
    const students = getStudents();
    const found = students.find(s => s.studentId === parentId.toUpperCase());
    if (found && password === 'parent123') {
      setStudentId(found.studentId);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Invalid Parent ID or Password. Use Student ID as Parent ID and "parent123" as password.');
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="text-primary-foreground" size={28} />
              </div>
              <CardTitle className="text-xl">Parent Portal</CardTitle>
              <p className="text-sm text-muted-foreground">{settings.instituteName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>}
              <div>
                <label className="text-sm font-medium">Parent ID (Student ID)</label>
                <Input value={parentId} onChange={e => setParentId(e.target.value)} placeholder="SBCI0001" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <Button className="w-full gap-2" onClick={handleLogin}><Lock size={16} /> Login</Button>
              <p className="text-xs text-center text-muted-foreground">Contact admin for your Parent ID and Password</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!student) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Student data not found.</div>;
  }

  const presentCount = student.attendance.filter(a => a.status === 'present').length;
  const totalAtt = student.attendance.length;
  const attPercent = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;
  const paidFees = student.feeRecords.filter(f => f.status === 'paid');
  const pendingFees = student.feeRecords.filter(f => f.status !== 'paid');
  const totalPaid = paidFees.reduce((a, b) => a + b.amount, 0);
  const totalPending = pendingFees.reduce((a, b) => a + b.amount + b.lateFee, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{settings.instituteName}</h1>
          <p className="text-xs opacity-80">Parent Portal</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => { setLoggedIn(false); setStudentId(''); }}>
          Logout
        </Button>
      </header>

      <div className="p-4 md:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold text-foreground">{student.name}'s Progress</h2>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{student.studentId}</Badge>
            <Badge variant="secondary">{student.course}</Badge>
            <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>{student.status}</Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Attendance" value={`${attPercent}%`} icon={ClipboardList} variant="primary" />
          <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={CreditCard} variant="success" />
          <StatCard title="Pending" value={`₹${totalPending.toLocaleString()}`} icon={CreditCard} variant="warning" />
          <StatCard title="Performance" value={attPercent >= 75 ? 'Good' : 'Low'} icon={TrendingUp} variant="accent" />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{student.name}</span></div>
                  <div><span className="text-muted-foreground">Father:</span> <span className="font-medium">{student.fatherName}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{student.course}</span></div>
                  <div><span className="text-muted-foreground">Admission:</span> <span className="font-medium">{new Date(student.admissionDate).toLocaleDateString('en-IN')}</span></div>
                  <div><span className="text-muted-foreground">Mobile:</span> <span className="font-medium">{student.mobile}</span></div>
                  <div><span className="text-muted-foreground">Monthly Fee:</span> <span className="font-medium">₹{student.feeAmount}</span></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader><CardTitle>Fee Records</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Month</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Paid Date</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.feeRecords.slice(-12).reverse().map(f => (
                      <TableRow key={f.id}>
                        <TableCell>{f.month}</TableCell>
                        <TableCell>₹{f.amount + f.lateFee}</TableCell>
                        <TableCell><Badge variant={f.status === 'paid' ? 'default' : 'destructive'}>{f.status}</Badge></TableCell>
                        <TableCell>{f.paidDate || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {student.attendance.slice(-28).map(a => (
                    <div
                      key={a.id}
                      className={`p-2 rounded text-center text-xs font-medium ${
                        a.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        a.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                      title={`${a.date} - ${a.status}`}
                    >
                      {new Date(a.date).getDate()}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200" /> Present</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200" /> Absent</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200" /> Late</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader><CardTitle>Notifications & Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {attPercent < 75 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                    ⚠️ <strong>Low Attendance Alert:</strong> Attendance is {attPercent}%. Minimum 75% required.
                  </div>
                )}
                {pendingFees.length > 0 && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                    💰 <strong>Fee Reminder:</strong> {pendingFees.length} month(s) fee pending. Total: ₹{totalPending}
                  </div>
                )}
                {student.messageHistory.slice(-5).reverse().map(msg => (
                  <div key={msg.id} className="p-3 bg-muted rounded-lg text-sm">
                    📩 {msg.message} <span className="text-xs text-muted-foreground ml-2">{msg.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
