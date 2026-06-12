import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Bookmark, Lock, Globe, Search, Zap, ArrowRight, Star } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';

const FEATURES = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Private by default',
    description: 'All bookmarks are encrypted to your Nostr key. Only you can read them.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Share what you want',
    description: 'Toggle any bookmark public to share it on your Nostr profile page.',
  },
  {
    icon: <Search className="w-5 h-5" />,
    title: 'Instant search',
    description: 'Full-text search across titles, descriptions, notes, and tags.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'No servers',
    description: 'Your data lives on the Nostr relay network. No sign-up, no vendor lock-in.',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Pinstr — Decentralized Bookmark Manager',
    description:
      'Save, organize, and optionally share bookmarks using the Nostr protocol. Private by default, open by choice.',
  });

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Pinstr</span>
          </div>
          <div className="flex items-center gap-3">
            <LoginArea className="max-w-44" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <Star className="w-3.5 h-3.5" />
          Built on Nostr
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your bookmarks,
          <br />
          <span className="text-primary">decentralized.</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Pinstr is a bookmark manager that uses the Nostr protocol as its backend.
          Your data is encrypted, portable, and owned entirely by you.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <LoginArea className="max-w-48" />
          <Button variant="outline" asChild>
            <a href="#features" className="gap-2">
              Learn more
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* Preview mockup */}
        <div className="mt-16 relative">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-8 bg-muted/50 border-b border-border flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-4 bg-muted rounded-md max-w-xs mx-auto" />
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Design Resources', 'Tech Articles', 'Startup Tools'].map((title, i) => (
                <div key={i} className="bg-background rounded-xl border border-border p-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">
                      {['🎨', '💻', '🚀'][i]}
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-muted shrink-0" />
                        <div
                          className="h-3 bg-muted rounded-md"
                          style={{ width: `${60 + j * 15}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Glow */}
          <div className="absolute -inset-4 -z-10 bg-primary/5 blur-3xl rounded-3xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need, nothing you don't
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-6 bg-card border border-border rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-primary rounded-2xl p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Connect your Nostr identity and start saving bookmarks in seconds.
          </p>
          <LoginArea className="max-w-48 mx-auto [&_button]:bg-white [&_button]:text-primary [&_button]:hover:bg-white/90" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Bookmark className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <span>Pinstr</span>
          </div>
          <p>
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Shakespeare
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
