import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'primary' | 'accent' | 'success' | 'warning';
}

const variantClasses = {
  primary: 'stat-card-gradient',
  accent: 'stat-card-accent',
  success: 'stat-card-success',
  warning: 'stat-card-warning',
};

export default function StatCard({ title, value, icon: Icon, variant }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${variantClasses[variant]} rounded-xl p-6 text-primary-foreground shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
