import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppLayout } from './AppLayout';

/**
 * /app/new — just open the new bookmark modal and redirect to /app.
 * Can accept ?url=... to pre-fill the URL.
 */
export default function AppNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openNewBookmark } = useAppLayout();

  useEffect(() => {
    const url = searchParams.get('url') ?? '';
    openNewBookmark(url);
    navigate('/app', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
