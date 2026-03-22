'use client';

export default function ProfileError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: '2rem', color: '#ff6b6b', background: '#1a1a2e', fontFamily: 'monospace', whiteSpace: 'pre-wrap', minHeight: '50vh' }}>
      <h1 style={{ color: '#ffd700' }}>Profile Page Error</h1>
      <p><strong>Message:</strong> {error.message}</p>
      <p><strong>Digest:</strong> {error.digest}</p>
      <p><strong>Name:</strong> {error.name}</p>
      <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '1rem' }}>{error.stack}</pre>
    </div>
  );
}
