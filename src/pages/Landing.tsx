import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, Users, IndianRupee, ClipboardList, MessageSquare, BarChart3,
  Shield, Smartphone, Cloud, Zap, CheckCircle, ArrowRight, Star, ChevronRight,
  Monitor, Bell, FileSpreadsheet, Award, Menu, X
} from 'lucide-react';

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
    name: 'Basic',
    price: '99',
    period: '/month',
    desc: 'Small institutes getting started',
    badge: '',
    features: [
      'Up to 50 Students',
      'Fee Management',
      'Attendance Tracking',
      'Student Panel',
      'Excel Export',
      'WhatsApp Templates',
      'Email Support',
    ],
    cta: 'Start Basic',
    popular: false,
  },
  {
    name: 'Advanced',
    price: '199',
    period: '/month',
    desc: 'Growing institutes with advanced needs',
    badge: 'Most Popular',
    features: [
      'Unlimited Students',
      'Everything in Basic',
      'Advanced Analytics',
      'Bulk Messages',
      'Auto Fee Reminders',
      'Certificate Generator',
      'Excel Import/Export',
      'Multi-device Login Tracking',
      'Priority Support',
    ],
    cta: 'Start Advanced',
    popular: true,
  },
  {
    name: 'AI Pro',
    price: '299',
    period: '/month',
    desc: 'Power users who want AI-driven insights',
    badge: 'AI Powered',
    features: [
      'Everything in Advanced',
      'AI-Powered Insights',
      'Predictive Fee Defaults',
      'Smart Attendance Alerts',
      'Custom Branding',
      'API Access',
      'Dedicated Support',
      'White Label Option',
    ],
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
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/login')}>Join Now</Button>
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
              <div className="flex gap-2 px-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="flex-1">Login</Button>
                <Button size="sm" onClick={() => navigate('/login')} className="flex-1">Join Now</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
              🚀 15 Students तक Free — कोई Credit Card नहीं चाहिए
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              अपने Institute को
              <span className="text-primary"> Digitally</span> Manage करें
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Students, Fees, Attendance, WhatsApp Messages — सब कुछ एक ही Dashboard से। 
              India का सबसे आसान Institute Management Software।
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 text-base px-8 py-6" onClick={() => navigate('/login')}>
                <Zap size={20} /> Free में शुरू करें <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                <Monitor size={20} /> Features देखें
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">सब कुछ एक जगह</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">आपके Institute को चलाने के लिए जो भी चाहिए — Student Management से लेकर Analytics तक</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">3 Steps में शुरू करें</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Account बनाएं', desc: 'Free signup करें, अपने Institute का नाम डालें, और तुरंत शुरू करें' },
              { step: '02', title: 'Students Add करें', desc: 'एक-एक करके या Excel से bulk import — Student ID automatic generate होगी' },
              { step: '03', title: 'Manage करें', desc: 'Fees track करें, attendance लगाएं, WhatsApp reminders भेजें — सब automatic' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
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
            <p className="text-muted-foreground mt-4">15 students तक बिल्कुल Free। उसके बाद सिर्फ ₹99/month से शुरू</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-2xl border-2 p-8 relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4">{plan.badge}</Badge>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle size={16} className="text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  {plan.cta} <ChevronRight size={16} />
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">🎉 15 Students तक हमेशा <strong className="text-foreground">Free</strong> — कोई hidden charges नहीं</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Institute Owners क्या कहते हैं</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="fill-warning text-warning" />
                  ))}
                </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">आज ही शुरू करें — Free!</h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">अपने Institute को InSuite Manage से Digital बनाएं। Setup सिर्फ 2 minutes में।</p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 gap-2 text-base px-8 py-6"
              onClick={() => navigate('/login')}
            >
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
                India's simplest Institute Management Software. Students, Fees, Attendance, Messages — सब एक जगह।
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>help@insuite.in</li>
                <li>WhatsApp Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
            © 2026 InSuite Manage. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
}