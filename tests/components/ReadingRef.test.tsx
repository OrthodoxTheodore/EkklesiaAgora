import { render, screen } from '@testing-library/react';
import { ReadingRef } from '@/components/calendar/ReadingRef';
import type { ReadingRef as ReadingRefType } from '@/lib/types/calendar';

const mockReading: ReadingRefType = {
  book: 'John',
  chapter: 3,
  verseStart: 16,
  verseEnd: 21,
  display: 'John 3:16-21',
};

describe('ReadingRef', () => {
  it('renders reading display text as non-interactive span (CAL-07)', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByText('John 3:16-21')).toBeInTheDocument();
  });

  it('has cursor-not-allowed class', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const span = screen.getByText('John 3:16-21');
    expect(span).toHaveClass('cursor-not-allowed');
  });

  it('has title attribute "Scripture Library — coming soon"', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByTitle('Scripture Library — coming soon')).toBeInTheDocument();
  });

  it('has aria-disabled="true"', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    const span = screen.getByText('John 3:16-21');
    expect(span).toHaveAttribute('aria-disabled', 'true');
  });
});
