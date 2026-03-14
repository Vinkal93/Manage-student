import { useState } from 'react';
import { Languages } from 'lucide-react';
import { getLang, setLang, type Lang } from '@/lib/i18n';

export default function LangToggle() {
  const [lang, setCurrentLang] = useState<Lang>(getLang());

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    setCurrentLang(next);
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors"
      title="Switch Language"
    >
      <Languages size={14} />
      {lang === 'en' ? 'हिंदी' : 'EN'}
    </button>
  );
}
