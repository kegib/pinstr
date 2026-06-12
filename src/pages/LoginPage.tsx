import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { LoginArea } from '@/components/auth/LoginArea';

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useLoggedInAccounts();

  useSeoMeta({
    title: 'Sign In — Pinstr',
    description: 'Sign in to Pinstr with your Nostr identity.',
  });

  useEffect(() => {
    if (!isLoading && currentUser) {
      navigate('/app', { replace: true });
    }
  }, [currentUser, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">Pinstr</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Pinstr</h1>
            <p className="text-muted-foreground">
              Connect your Nostr identity to access your bookmarks.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <LoginArea className="w-full" />

            <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground text-sm">Login options:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">→</span>
                  <span>
                    <strong>Browser extension</strong> (NIP-07): Use Alby, nos2x, or
                    similar extensions. Most secure option.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">→</span>
                  <span>
                    <strong>Private key</strong> (nsec): Enter your nsec directly.
                    Use only on trusted devices.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">→</span>
                  <span>
                    <strong>New account</strong>: Generate a new Nostr keypair to
                    get started instantly.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your bookmarks are stored on Nostr relays and encrypted by default.
            No email or password required.
          </p>
        </div>
      </main>
    </div>
  );
}
