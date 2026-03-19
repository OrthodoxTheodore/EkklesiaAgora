import { render, screen } from '@testing-library/react';
import { ReadingRef } from '@/components/calendar/ReadingRef';
import type { ReadingRef as ReadingRefType } from '@/lib/types/calendar';

// Mock next/link to render as <a>
jest.mock('next/link', () => {
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock BOOK_ABBREV_MAP with sufficient entries for testing
jest.mock('@/lib/types/scripture', () => ({
  BOOK_ABBREV_MAP: {
    John: { slug: 'john', name: 'John', testament: 'NT', index: 4 },
    Romans: { slug: 'romans', name: 'Romans', testament: 'NT', index: 6 },
    Genesis: { slug: 'genesis', name: 'Genesis', testament: 'OT', index: 1 },
  },
}));

const mockReading: ReadingRefType = {
  book: 'John',
  chapter: 3,
  verseStart: 16,
  verseEnd: 21,
  display: 'John 3:16-21',
};

describe('ReadingRef (activated — CAL-07)', () => {
  it('renders reading display text', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByText('John 3:16-21')).toBeInTheDocument();
  });

  it('renders as a Link (<a>) element instead of disabled span', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const link = screen.getByRole('link', { name: 'John 3:16-21' });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('href navigates to /scripture/john/3#verse-16', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const link = screen.getByRole('link', { name: 'John 3:16-21' });
    expect(link).toHaveAttribute('href', '/scripture/john/3#verse-16');
  });

  it('link text matches reading.display', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('John 3:16-21');
  });

  it('does NOT have cursor-not-allowed class', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const link = screen.getByRole('link', { name: 'John 3:16-21' });
    expect(link).not.toHaveClass('cursor-not-allowed');
  });

  it('renders the label text', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByText('Holy Gospel:')).toBeInTheDocument();
  });
});
