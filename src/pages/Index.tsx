import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Bookmark, Lock, Globe, Search, Zap, ArrowRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';

const FEATURES = [
  {
    icon: <Lock className="w-4 h-4" />,
    title: 'private by default',
    description: 'All bookmarks are NIP-44 encrypted to your key. Relays see nothing.',
  },
  {
    icon: <Globe className="w-4 h-4" />,
    title: 'public sharing',
    description: 'Toggle any bookmark public. It appears on your /p/<npub> profile page.',
  },
  {
    icon: <Search className="w-4 h-4" />,
    title: 'instant search',
    description: 'Full-text search across titles, descriptions, notes, and tags.',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: 'no servers',
    description: 'Backend is the Nostr relay network. No account, no lock-in.',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'keepstr — decentralized bookmark manager',
    description: 'Save, organize, and share bookmarks using the Nostr protocol. Private by default.',
  });

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#c8c8d0', fontFamily: "'SF Mono','JetBrains Mono','Cascadia Code','Fira Code',Menlo,Consolas,monospace", fontSize: '13px' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f1f25', background: 'linear-gradient(180deg, #0d0d10 0%, #0a0a0a 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#7B68EE', borderRadius: '4px' }}>
              <Bookmark className="w-3.5 h-3.5" style={{ color: '#0a0a0a' }} />
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: '#9B8FFF', letterSpacing: '0.6px' }}>
              keepstr
            </span>
          </div>
          <LoginArea className="max-w-44" />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        {/* Terminal badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-[11px]"
          style={{ border: '1px solid #2a2a32', borderRadius: '3px', color: '#7B68EE', background: 'rgba(123,104,238,0.08)' }}
        >
          <span style={{ color: '#3DDC84' }}>●</span>
          built on nostr
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
          style={{ color: '#ececf0', letterSpacing: '-0.5px' }}
        >
          your bookmarks,{' '}
          <span style={{ color: '#9B8FFF' }}>decentralized.</span>
        </h1>

        <p className="text-base mb-10 max-w-xl leading-relaxed" style={{ color: '#8a8a98' }}>
          keepstr is a bookmark manager backed by the Nostr protocol.
          Encrypted, portable, owned entirely by you — no server required.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <LoginArea className="max-w-48" />
          <a
            href="#features"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs transition-all"
            style={{
              border: '1px solid #2a2a32',
              borderRadius: '3px',
              color: '#c8c8d0',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#7B68EE'; (e.currentTarget as HTMLAnchorElement).style.color = '#9B8FFF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a32'; (e.currentTarget as HTMLAnchorElement).style.color = '#c8c8d0'; }}
          >
            learn more
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Terminal mockup */}
        <div className="mt-16 overflow-hidden" style={{ border: '1px solid #1f1f25', borderRadius: '5px', background: '#111113' }}>
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: '1px solid #1f1f25', background: '#0a0a0a' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5A5A' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFB020' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3DDC84' }} />
            <span className="ml-2 text-[11px]" style={{ color: '#5a5a6a' }}>keepstr — all bookmarks</span>
          </div>
          {/* Mock grid */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '🎨', name: 'Design', count: 12, color: '#7B68EE' },
              { icon: '💻', name: 'Dev Tools', count: 8, color: '#3DDC84' },
              { icon: '🚀', name: 'Startups', count: 5, color: '#FFB020' },
            ].map((col) => (
              <div
                key={col.name}
                className="p-3"
                style={{ background: '#141418', border: '1px solid #1f1f25', borderRadius: '3px', borderTop: `2px solid ${col.color}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{col.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#ececf0' }}>{col.name}</span>
                  <span className="ml-auto text-[10px]" style={{ color: '#5a5a6a' }}>{col.count}</span>
                </div>
                <div className="space-y-1.5">
                  {[85, 65, 75].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: '#1f1f25' }} />
                      <div className="h-2 rounded-sm" style={{ width: `${w}%`, background: '#2a2a32' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-4xl mx-auto px-6 py-16">
        <div
          className="text-[10px] uppercase tracking-widest mb-6"
          style={{ color: '#5a5a6a', letterSpacing: '1.8px' }}
        >
          Features
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-3 p-4"
              style={{ background: '#111113', border: '1px solid #1f1f25', borderRadius: '5px' }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center shrink-0"
                style={{ background: 'rgba(123,104,238,0.12)', borderRadius: '3px', color: '#7B68EE' }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-xs font-semibold mb-1" style={{ color: '#ececf0' }}>{f.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8a8a98' }}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div
          className="p-8 text-center"
          style={{ background: '#111113', border: '1px solid #2a2a32', borderRadius: '5px', borderTop: '1px solid #7B68EE' }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ color: '#ececf0' }}>
            ready to take control?
          </h2>
          <p className="text-xs mb-6" style={{ color: '#8a8a98' }}>
            connect your Nostr identity and start saving bookmarks in seconds.
          </p>
          <div className="flex justify-center">
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f1f25' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]" style={{ color: '#5a5a6a' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#7B68EE', borderRadius: '2px' }}>
              <Bookmark className="w-2 h-2" style={{ color: '#0a0a0a' }} />
            </div>
            <span>keepstr</span>
          </div>
          <p>
            vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#7B68EE', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
            >
              shakespeare
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
