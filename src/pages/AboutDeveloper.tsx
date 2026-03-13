import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Github, Linkedin, Globe, BookOpen, Code, Cpu, GraduationCap,
  Rocket, Heart, ExternalLink, Mail, Phone
} from 'lucide-react';

const skills = [
  { category: 'Frontend', items: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Node.js', 'Express.js', 'Firebase', 'Python'] },
  { category: 'App Dev', items: ['Android SDK', 'Gradle', 'Kotlin'] },
  { category: 'Design', items: ['Figma', 'Material UI', 'UI/UX'] },
  { category: 'AI & Tools', items: ['Chatbot Dev', 'Automation', 'AI Integration'] },
  { category: 'Education', items: ['Tally Prime', 'Typing Tutor', 'CCC Notes'] },
];

const projects = [
  { name: 'Vinkal041 Chatbot', desc: 'AI chatbot with developer credits and teaching capabilities', icon: Cpu },
  { name: 'Tally Prime Practice Guide', desc: 'Progressive difficulty levels V1-V10 with real-world accounting cases', icon: BookOpen },
  { name: 'VinCom UI Library', desc: '200+ reusable React components with live previews and NPM integration', icon: Code },
  { name: 'Typing Tutor Platform', desc: 'Structured platform with daily lessons, tracking, and gamified exercises', icon: GraduationCap },
  { name: 'InSuite Manage', desc: 'Complete Institute Management SaaS platform with multi-tenant support', icon: Rocket },
];

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/vinkal041', icon: Github },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/vinkal041', icon: Linkedin },
  { name: 'Blog', url: 'https://vinkal041.blogspot.com/', icon: Globe },
  { name: 'Hashnode', url: 'https://hashnode.com/@vinkal041', icon: BookOpen },
];

export default function AboutDeveloper() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to Home
          </Button>
          <span className="text-sm font-semibold text-foreground">About Developer</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl shrink-0">
            <img src="/developer-vinkal.jpeg" alt="Vinkal Prajapati" className="w-full h-full object-cover" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-3">👨‍💻 Developer & Educator</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Vinkal Prajapati</h1>
            <p className="text-muted-foreground mt-2 text-lg">Developer, Educator & AI Researcher</p>
            <p className="text-muted-foreground mt-3 leading-relaxed text-sm max-w-xl">
              A passionate multi-dimensional innovator redefining how technology and creativity merge together. From developing professional-level AI tools, custom web browsers, React-based apps, and typing tutor platforms, to guiding students in Tally Prime and CCC exams.
            </p>
            <blockquote className="mt-4 border-l-4 border-primary pl-4 text-sm italic text-muted-foreground">
              "Technology is not just about coding; it's about connecting people, solving problems, and shaping the world for better."
            </blockquote>
            <div className="flex gap-2 mt-5">
              {socialLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5"><link.icon size={14} /> {link.name}</Button>
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">🧰 Core Expertise</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((group, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">🚀 Major Projects</h2>
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <project.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Vision */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">💡 Vision & Goals</h2>
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            {[
              'Build a complete AI-driven learning ecosystem',
              'Create a verified student hiring platform',
              'Launch smart educational bots',
              'Promote digital literacy and self-learning culture in India',
            ].map((goal, i) => (
              <div key={i} className="flex items-center gap-3">
                <Rocket size={16} className="text-primary shrink-0" />
                <p className="text-sm text-foreground">{goal}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-primary rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground mb-3">Let's Connect!</h2>
            <p className="text-primary-foreground/80 mb-4">Interested in collaborating, learning, or featuring projects?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                <Mail size={14} /> vinkal93041@gmail.com
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                <Phone size={14} /> 9118245636
              </div>
            </div>
            <div className="flex gap-2 justify-center mt-5">
              {socialLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="gap-1.5"><link.icon size={14} /> {link.name}</Button>
                </a>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer credit */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Developed with <Heart size={14} className="text-destructive" /> by <strong className="text-foreground">Vinkal Prajapati</strong>
        </p>
      </footer>
    </div>
  );
}
