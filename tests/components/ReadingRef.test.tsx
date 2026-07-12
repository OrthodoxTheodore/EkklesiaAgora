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
  it('renders reading display text', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByText('John 3:16-21')).toBeInTheDocument();
  });

  it('renders as plain text, not a link', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the label text', () => {
    render(<ReadingRef reading={mockReading} label="Holy Gospel" />);
    expect(screen.getByText('Holy Gospel:')).toBeInTheDocument();
  });
});
