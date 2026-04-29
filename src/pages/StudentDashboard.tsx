import { useMemo, useRef, useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getStudents, updateStudentPhoto, loadStudentsFromFirebase } from '@/lib/store';
import { getAssignments } from '@/lib/assignments';
import { getSettings } from '@/lib/settings';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { motion } from 'framer-motion';
import { GraduationCap, CreditCard, ClipboardList, MessageSquare, BookOpen, FileText, Bell, Link as LinkIcon, Youtube, Download, QrCode, Loader2, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getFeatures, calcLateFee, loadFeaturesFromFirebase } from '@/lib/features';
import { fbOnFeaturesChange } from '@/lib/firebaseStore';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const user = getCurrentUser();
  const settings = getSettings();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoVer, setPhotoVer] = useState(0);
  const [features, setFeatures] = useState(getFeatures());
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState(getStudents());

  // Load data from Firebase on mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Load students from Firebase
        const fbStudents = await loadStudentsFromFirebase();
        if (mounted) setStudents(fbStudents);

        // Load features from Firebase
        const fbFeatures = await loadFeaturesFromFirebase();
        if (mounted) setFeatures(fbFeatures);
      } catch (e) {
        console.error('Failed to load data from Firebase:', e);
      }
      if (mounted) setLoading(false);
    };

    loadData();

    // Listen to realtime feature changes
    const unsubFeatures = fbOnFeaturesChange((newFeatures) => {
      if (newFeatures && mounted) {
        setFeatures(prev => ({
          ...prev,
          ...newFeatures,
          toggles: { ...prev.toggles, ...(newFeatures.toggles || {}) },
        }));
      }
    });

    return () => {
      mounted = false;
      unsubFeatures();
    };
  }, []);

  // Find student — try multiple matching strategies
  const student = useMemo(() => {
    if (!user) return null;
    const currentStudents = getStudents(); // Ensure we have latest data after photo upload
    // Strategy 1: Match by studentId
    const byStudentId = currentStudents.find(s => s.studentId === user.studentId);
    if (byStudentId) return byStudentId;
    // Strategy 2: Match by Firebase UID
    const byUid = currentStudents.find(s => s.firebaseUid === user.id);
    if (byUid) return byUid;
    // Strategy 3: Match by id
    const byId = currentStudents.find(s => s.id === user.id);
    if (byId) return byId;
    return null;
  }, [user, students, photoVer]);

  const assignmentMessages = useMemo(() => {
    if (!student) return [];
    const assignments = getAssignments();
    // Get assignments that target this student's course or are for 'All'
    return assignments
      .filter(a => {
        const cn = a.className.toLowerCase();
        const sc = student.course.toLowerCase();
        return cn === 'all' || cn.includes(sc) || cn.includes('all');
      })
      .map(a => ({
        id: a.id,
        date: a.createdAt,
        title: a.title,
        subject: a.subject,
        deadline: a.deadline,
        description: a.description,
        isOverdue: new Date(a.deadline) < new Date(),
        submitted: a.submissions.some(s => s.studentId === student.studentId),
      }));
  }, [student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-primary mx-auto" size={32} />
          <p className="text-sm text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <GraduationCap className="text-destructive" size={28} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Student data not found</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Your profile data is being set up. Please contact your institute administrator or try again in a few minutes.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          🔄 Refresh Page
        </button>
      </div>
    );
  }

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { toast.error('Photo too large (max 1.5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateStudentPhoto(student.id, reader.result as string);
      toast.success('Photo updated successfully');
      setPhotoVer(v => v + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!student.photo) return;
    updateStudentPhoto(student.id, '');
    toast.success('Photo removed');
    setPhotoVer(v => v + 1);
  };

  const presentCount = student.attendance.filter(a => a.status === 'present').length;
  const totalAttendance = student.attendance.length;
  const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
  const paidFees = student.feeRecords.filter(f => f.status === 'paid').length;
  const pendingFees = student.feeRecords.filter(f => f.status !== 'paid').length;
  const totalPaid = student.feeRecords.filter(f => f.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const totalLate = student.feeRecords.reduce((acc, f) => acc + calcLateFee(f.dueDate, f.status === 'paid', f.paidDate), 0);
  const totalPending = student.feeRecords.filter(f => f.status !== 'paid').reduce((a, b) => a + b.amount, 0);
  const totalPayable = totalPending + totalLate;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
        <div className="relative group">
          {student.photo ? (
            <img src={student.photo} alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
          <button
            onClick={() => photoInputRef.current?.click()}
            title="Change photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background hover:scale-105 transition">
            <Camera size={12} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Welcome {student.name} 👋</h1>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="outline" className="gap-1 text-[10px]"><GraduationCap size={10} /> {student.studentId}</Badge>
            <Badge variant="secondary" className="text-[10px]">{student.course}</Badge>
            <Badge variant="outline" className="text-[10px]">Joined {new Date(student.admissionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</Badge>
          </div>
          {student.photo && (
            <button onClick={handleRemovePhoto} className="text-[10px] text-destructive hover:underline inline-flex items-center gap-1 mt-1">
              <Trash2 size={10} /> Remove photo
            </button>
          )}
        </div>
      </motion.div>

      {/* Stopped Account Warning Banner */}
      {student.status === 'stopped' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-destructive text-sm">Account Suspended / अकाउंट रोक दिया गया है</h3>
            {student.stopReason && <p className="text-sm text-foreground mt-1">कारण: {student.stopReason}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              कृपया संस्थान से संपर्क करें: {settings.instituteContactNumber || settings.phone || 'Admin'}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${attendancePercent}%`} icon={ClipboardList} variant="primary" />
        <StatCard title="Fees Paid" value={paidFees} icon={CreditCard} variant="success" />
        <StatCard title="Pending Fees" value={pendingFees} icon={CreditCard} variant="warning" />
        <StatCard title="Total Payable" value={`₹${totalPayable.toLocaleString()}`} icon={CreditCard} variant="accent" />
      </div>

      {features.toggles.onlinePayment && totalPayable > 0 && (
        <Link to="/student/payment" className="block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Pending Payment</p>
              <p className="text-2xl font-bold">₹{totalPayable.toLocaleString()}</p>
              {totalLate > 0 && <p className="text-xs opacity-80 mt-1">Includes ₹{totalLate} late fee</p>}
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-lg">
              <QrCode size={18} /> Pay Now
            </div>
          </div>
        </Link>
      )}

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1.5 bg-muted/60 gap-1">
          <TabsTrigger value="messages" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><MessageSquare size={14} /> <span className="hidden xs:inline sm:inline">Messages</span></TabsTrigger>
          <TabsTrigger value="assignments" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><FileText size={14} /> <span>Tasks</span></TabsTrigger>
          <TabsTrigger value="fees" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><CreditCard size={14} /> Fees</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><ClipboardList size={14} /> <span className="hidden xs:inline">Att.</span><span className="xs:hidden">Att</span></TabsTrigger>
          <TabsTrigger value="course" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><BookOpen size={14} /> Course</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs gap-1 py-2 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow font-medium"><LinkIcon size={14} /> More</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="space-y-3">
            {/* Assignment Notifications */}
            {assignmentMessages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Bell size={14} className="text-primary" /> Assignment Notifications</h3>
                {assignmentMessages.map(am => (
                  <motion.div key={am.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`bg-card rounded-xl border p-4 ${am.submitted ? 'border-accent/30' : am.isOverdue ? 'border-destructive/30' : 'border-primary/30'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">{am.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{am.subject}</Badge>
                          <Badge variant={am.submitted ? 'default' : am.isOverdue ? 'destructive' : 'secondary'} className="text-xs">
                            {am.submitted ? '✅ Submitted' : am.isOverdue ? '⏰ Overdue' : `Due: ${am.deadline}`}
                          </Badge>
                        </div>
                        {am.description && <p className="text-xs text-muted-foreground mt-1">{am.description}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(am.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Regular Messages */}
            <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
              <div className="p-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Institute Messages</h3>
              </div>
              {student.messageHistory.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No messages yet</div>
              ) : (
                student.messageHistory.map(m => (
                  <div key={m.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">{m.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-foreground">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
            {assignmentMessages.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No assignments assigned to you</div>
            ) : (
              assignmentMessages.map(am => (
                <div key={am.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{am.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{am.subject}</Badge>
                        <Badge variant={am.submitted ? 'default' : am.isOverdue ? 'destructive' : 'secondary'} className="text-xs">
                          {am.submitted ? '✅ Submitted' : am.isOverdue ? '⏰ Overdue' : `Due: ${am.deadline}`}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{am.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="fees">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Paid On</th>
                </tr>
              </thead>
              <tbody>
                {student.feeRecords.map(f => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{f.month}</td>
                    <td className="p-4 text-foreground">₹{f.amount}</td>
                    <td className="p-4"><Badge variant={f.status === 'paid' ? 'default' : 'destructive'} className="text-xs capitalize">{f.status}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell">{f.paidDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance.slice(-30).reverse().map(a => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td className="p-3"><Badge variant={a.status === 'present' ? 'default' : 'destructive'} className="text-xs capitalize">{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="course">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Course Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Course</p><p className="font-medium text-foreground">{student.course}</p></div>
              <div><p className="text-muted-foreground">Monthly Fee</p><p className="font-medium text-foreground">₹{student.feeAmount}</p></div>
              <div><p className="text-muted-foreground">Duration</p><p className="font-medium text-foreground">{student.course === 'ADCA' || student.course === 'PGDCA' ? '12 Months' : '6 Months'}</p></div>
              <div><p className="text-muted-foreground">Certificate</p><p className="font-medium text-foreground">On Completion</p></div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{settings.instituteName} - Rules:</p>
              <p>• Fee must be paid before {settings.feeDueDate}th of every month</p>
              <p>• Late fee of ₹{settings.lateFeeAmount} may apply after {settings.feeDueDate}th</p>
              <p>• Minimum 75% attendance required for certificate</p>
              <p>• Classes may be stopped for pending fees beyond 20 days</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-4">
            {features.toggles.importantLinks && features.importantLinks.filter(l => l.visible).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2"><LinkIcon size={14}/> Important Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.importantLinks.filter(l => l.visible).map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="text-sm p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      🔗 {l.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {features.toggles.studyMaterial && features.studyMaterial.filter(l => l.visible).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2"><BookOpen size={14}/> Study Material</h3>
                <div className="space-y-2">
                  {features.studyMaterial.filter(l => l.visible).map(l => (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block text-sm p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      📚 {l.title}{l.description && <span className="text-xs text-muted-foreground block">{l.description}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {features.toggles.youtube && features.youtubeUrl && (
                <a href={features.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-medium">
                  <Youtube size={16} /> YouTube Channel
                </a>
              )}
              {features.toggles.downloadApp && features.appDownloadUrl && (
                <a href={features.appDownloadUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
                  <Download size={16} /> Download App
                </a>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
