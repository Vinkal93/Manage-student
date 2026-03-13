import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, User, MapPin, BookOpen, CheckCircle, GraduationCap, Clock } from 'lucide-react';

interface RegistrationData {
  instituteName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  instituteType: string;
  numberOfStudents: string;
  coursesOffered: string;
}

const steps = [
  { title: 'Basic Information', icon: User, desc: 'Institute & Owner Details' },
  { title: 'Institute Details', icon: MapPin, desc: 'Location Information' },
  { title: 'Additional Details', icon: BookOpen, desc: 'Type & Courses' },
  { title: 'Review & Submit', icon: CheckCircle, desc: 'Confirm Your Details' },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    instituteName: '', ownerName: '', email: '', phone: '',
    address: '', city: '', state: '', country: 'India',
    instituteType: '', numberOfStudents: '', coursesOffered: '',
  });

  const update = (key: keyof RegistrationData, value: string) => setData(d => ({ ...d, [key]: value }));

  const canNext = () => {
    if (step === 0) return data.instituteName && data.ownerName && data.email && data.phone;
    if (step === 1) return data.address && data.city && data.state;
    if (step === 2) return data.instituteType && data.numberOfStudents;
    return true;
  };

  const handleSubmit = () => {
    const registrations = JSON.parse(localStorage.getItem('insuite_registrations') || '[]');
    registrations.push({
      id: crypto.randomUUID(),
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('insuite_registrations', JSON.stringify(registrations));
    setSubmitted(true);
    toast.success('Application submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-success" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Application Submitted!</h1>
          <div className="bg-card border border-border rounded-xl p-6 space-y-3 text-left mb-6">
            <p className="text-sm text-foreground">Your application has been submitted successfully.</p>
            <p className="text-sm text-muted-foreground">Please wait for Super Admin approval. Your account will be activated after approval.</p>
            <div className="flex items-center gap-2 pt-2">
              <Clock size={14} className="text-warning" />
              <Badge variant="outline" className="text-warning border-warning">Status: Awaiting Approval</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Institute: <strong className="text-foreground">{data.instituteName}</strong></p>
          <Button onClick={() => navigate('/')} className="gap-2"><ArrowLeft size={16} /> Back to Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Home
        </Button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="text-primary-foreground" size={28} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Register Your Institute</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing your institute for free</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</div>
              {i < steps.length - 1 && <div className={`h-0.5 w-6 sm:w-12 transition-colors ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-lg p-6">
          <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            {(() => { const Icon = steps[step].icon; return <Icon size={18} className="text-primary" />; })()}
            {steps[step].title}
          </h2>
          <p className="text-xs text-muted-foreground mb-5">{steps[step].desc}</p>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Institute Name *</Label>
                    <Input placeholder="e.g. ABC Computer Institute" value={data.instituteName} onChange={e => update('instituteName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Name *</Label>
                    <Input placeholder="Full name" value={data.ownerName} onChange={e => update('ownerName', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="owner@institute.com" value={data.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input placeholder="9876543210" value={data.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Institute Address *</Label>
                    <Textarea placeholder="Full address" value={data.address} onChange={e => update('address', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input placeholder="City" value={data.city} onChange={e => update('city', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input placeholder="State" value={data.state} onChange={e => update('state', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={data.country} onChange={e => update('country', e.target.value)} />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Institute Type *</Label>
                    <Select value={data.instituteType} onValueChange={v => update('instituteType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer">Computer Institute</SelectItem>
                        <SelectItem value="coaching">Coaching Center</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="training">Training Center</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Approximate Number of Students *</Label>
                    <Select value={data.numberOfStudents} onValueChange={v => update('numberOfStudents', v)}>
                      <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-15">1 - 15 (Free Plan)</SelectItem>
                        <SelectItem value="16-50">16 - 50</SelectItem>
                        <SelectItem value="51-100">51 - 100</SelectItem>
                        <SelectItem value="101-500">101 - 500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Courses Offered</Label>
                    <Textarea placeholder="e.g. ADCA, DCA, Tally, CCC, Web Design" value={data.coursesOffered} onChange={e => update('coursesOffered', e.target.value)} />
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">Institute:</span> <span className="font-medium text-foreground">{data.instituteName}</span></div>
                      <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium text-foreground">{data.ownerName}</span></div>
                      <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{data.email}</span></div>
                      <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{data.phone}</span></div>
                      <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{data.address}, {data.city}, {data.state}, {data.country}</span></div>
                      <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground capitalize">{data.instituteType}</span></div>
                      <div><span className="text-muted-foreground">Students:</span> <span className="font-medium text-foreground">{data.numberOfStudents}</span></div>
                      {data.coursesOffered && <div className="col-span-2"><span className="text-muted-foreground">Courses:</span> <span className="font-medium text-foreground">{data.coursesOffered}</span></div>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">By submitting, you agree to the terms of service. Your account will be activated after Super Admin approval.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="gap-1">
              <ArrowLeft size={14} /> Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canNext()} onClick={() => setStep(s => s + 1)} className="gap-1">
                Next <ArrowRight size={14} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-1 bg-success hover:bg-success/90">
                <CheckCircle size={14} /> Submit Application
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
