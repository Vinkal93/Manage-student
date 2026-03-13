import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, Users, IndianRupee, ClipboardList, MessageSquare, BarChart3,
  Shield, Smartphone, Cloud, Zap, CheckCircle, ArrowRight, Star, ChevronRight,
  Monitor, Bell, FileSpreadsheet, Award, Menu, X, Mail, Phone, Heart, Code, ExternalLink
} from 'lucide-react';

const typewriterWords = [
  'Institute Management System',
  'Student Tracking Platform',
  'Smart Learning Dashboard',
  'Digital Institute Solution',
  'Advanced Education System',
];

function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setText(word.slice(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx((wordIdx + 1) % words.length);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
}

const features = [
  { icon: Users, title: 'Student Management', desc: 'Complete student lifecycle — admission, ID generation, password management, block/unblock controls' },
  { icon: IndianRupee, title: 'Fee Management', desc: 'Track every rupee with advanced filters, auto late-fee calculation, and payment mode tracking' },
  { icon: ClipboardList, title: 'Attendance System', desc: 'Daily attendance with present/absent/late marking, bulk mark, and attendance analytics' },
  { icon: MessageSquare, title: 'WhatsApp Automation', desc: 'Auto fee reminders, welcome messages, bulk notifications with customizable templates' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue charts, course-wise stats, student login tracking with device & browser info' },
  { icon: Shield, title: 'Firebase Auth', desc: 'Secure role-based authentication — admin and student login with Firebase integration' },
  { icon: FileSpreadsheet, title: 'Excel Import/Export', desc: 'Bulk student import from Excel, export students, fees, attendance to Excel/CSV' },
  { icon: Award, title: 'Certificate System', desc: 'Auto-generate course completion certificates with institute branding' },
  { icon: Bell, title: 'Auto Reminders', desc: '5th, 10th, 15th, 20th — escalating fee reminders automatically sent to students' },
  { icon: Monitor, title: 'Student Panel', desc: 'Students view their own fees, attendance, messages, and course info after login' },
  { icon: Cloud, title: 'Cloud Powered', desc: 'Secure cloud infrastructure with real-time data sync across all devices' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Fully responsive design works perfectly on phones, tablets, and desktops' },
];

const pricing = [
  {
    name: 'Free',
    price: '0',
    period: '/forever',
    desc: 'Try before you commit',
    badge: 'Start Free',
    features: ['Up to 15 Students', 'Fee Management', 'Attendance Tracking', 'Student Panel', 'Basic Reports', 'Email Support'],
    cta: 'Start for Free',
    popular: false,
    free: true,
  },
  {
    name: 'Basic',
    price: '99',
    period: '/month',
    desc: 'Small institutes getting started',
    badge: '',
    features: ['Up to 50 Students', 'Everything in Free', 'Excel Export', 'WhatsApp Templates', 'Fee Analytics', 'Priority Email Support'],
    cta: 'Start Basic',
    popular: false,
  },
  {
    name: 'Advanced',
    price: '199',
    period: '/month',
    desc: 'Growing institutes with advanced needs',
    badge: 'Most Popular',
    features: ['Unlimited Students', 'Everything in Basic', 'Advanced Analytics', 'Bulk Messages', 'Auto Fee Reminders', 'Certificate Generator', 'Excel Import/Export', 'Multi-device Tracking', 'Priority Support'],
    cta: 'Start Advanced',
    popular: true,
  },
  {
    name: 'AI Pro',
    price: '299',
    period: '/month',
    desc: 'Power users who want AI-driven insights',
    badge: 'AI Powered',
    features: ['Everything in Advanced', 'AI-Powered Insights', 'Predictive Fee Defaults', 'Smart Attendance Alerts', 'Custom Branding', 'API Access', 'Dedicated Support', 'White Label Option'],
    cta: 'Start AI Pro',
    popular: false,
  },
];

const testimonials = [
  { name: 'Rajesh Kumar', institute: 'Krishna Computer Center', text: 'InSuite Manage ne hamare institute ka poora management digital kar diya. Ab sab kuch ek click mein hota hai.', rating: 5 },
  { name: 'Priya Singh', institute: 'Future Tech Academy', text: 'Fee tracking aur WhatsApp reminders se ab koi bhi fee pending nahi rehti. Best software for institutes!', rating: 5 },
  { name: 'Amit Verma', institute: 'Digital Skills Hub', text: 'Student management, attendance, analytics — sab ek jagah. Bahut hi professional tool hai.', rating: 5 },
];

const stats = [
  { value: '500+', label: 'Institutes' },
  { value: '50,000+', label: 'Students Managed' },
  { value: '₹2Cr+', label: 'Fees Tracked' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const typedText = useTypewriter(typewriterWords);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="text-primary-foreground" size={20} />
              </div>
              <span className="text-xl font-bold text-foreground">InSuite Manage</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <button onClick={() => navigate('/about-developer')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Developer</button>
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Join Now</Button>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Reviews</a>
              <button onClick={() => navigate('/about-developer')} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full text-left">Developer</button>
              <div className="flex gap-2 px-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="flex-1">Login</Button>
                <Button size="sm" onClick={() => navigate('/register')} className="flex-1">Join Now</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero with Typewriter */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
              🚀 15 Students तक Free — कोई Credit Card नहीं चाहिए
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Your Complete
              <br />
              <span className="text-primary inline-block min-h-[1.2em]">
                {typedText}<span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Students, Fees, Attendance, WhatsApp Messages — सब कुछ एक ही Dashboard से।
              India's simplest Institute Management Software.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 text-base px-8 py-6" onClick={() => navigate('/register')}>
                <Zap size={20} /> Start for Free <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6" onClick={() => navigate('/login')}>
                <Shield size={20} /> Login
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Complete suite for managing your institute — from Student Management to Analytics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Get Started in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Register Your Institute', desc: 'Fill a simple form, get approval, and start managing your institute instantly' },
              { step: '02', title: 'Add Students', desc: 'Add students one by one or bulk import from Excel — IDs generate automatically' },
              { step: '03', title: 'Manage Everything', desc: 'Track fees, attendance, send WhatsApp reminders — all automated' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Simple & Transparent Pricing</h2>
            <p className="text-muted-foreground mt-4">15 students free forever. Plans start at just ₹99/month</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-2xl border-2 p-6 relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'}`}>
                {plan.badge && plan.badge !== 'Start Free' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4">{plan.badge}</Badge>
                )}
                {plan.free && <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-success text-success-foreground">Free Forever</Badge>}
                <h3 className="text-lg font-bold text-foreground mt-2">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                <div className="mt-4 mb-4">
                  <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle size={14} className="text-success shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : plan.free ? 'default' : 'outline'} size="sm"
                  onClick={() => plan.free ? navigate('/register') : navigate('/register')}>
                  {plan.cta} <ChevronRight size={14} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">What Institute Owners Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6">
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={16} className="fill-warning text-warning" />))}</div>
                <p className="text-sm text-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.institute}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">Start Managing Your Institute Today!</h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">Free for up to 15 students. No credit card required. Setup in 2 minutes.</p>
            <Button size="lg" variant="secondary" className="mt-8 gap-2 text-base px-8 py-6" onClick={() => navigate('/register')}>
              <Zap size={20} /> Join Now — It's Free <ArrowRight size={18} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground" size={18} />
                </div>
                <span className="text-lg font-bold text-foreground">InSuite Manage</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                India's simplest Institute Management Software. Students, Fees, Attendance, Messages — all in one place.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={14} /> vinkal93041@gmail.com
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={14} /> 9118245636
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-foreground transition-colors">Register</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/login')} className="hover:text-foreground transition-colors">Login</button></li>
                <li><button onClick={() => navigate('/about-developer')} className="hover:text-foreground transition-colors">About Developer</button></li>
                <li><a href="https://github.com/vinkal041" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">GitHub <ExternalLink size={10} /></a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
            <p>© 2026 InSuite Manage. All rights reserved.</p>
            <p className="mt-1 flex items-center justify-center gap-1">
              Developed with <Heart size={12} className="text-destructive" /> by <a href="/about-developer" className="font-medium text-foreground hover:text-primary transition-colors">Vinkal Prajapati</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
