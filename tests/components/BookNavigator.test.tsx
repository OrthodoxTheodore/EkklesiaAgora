import { render, screen, fireEvent } from '@testing-library/react';
import { BookNavigator } from '@/components/scripture/BookNavigator';
import type { ScriptureBook } from '@/lib/types/scripture';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Button component (uses 'use client' but should work in jsdom)
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

const sampleBooks: ScriptureBook[] = [
  {
    bookId: 'brenton_genesis',
    translationId: 'brenton',
    bookIndex: 1,
    bookName: 'Genesis',
    bookAbbrev: 'genesis',
    testament: 'OT',
    chapterCount: 50,
  },
  {
    bookId: 'brenton_exodus',
    translationId: 'brenton',
    bookIndex: 2,
    bookName: 'Exodus',
    bookAbbrev: 'exodus',
    testament: 'OT',
    chapterCount: 40,
  },
  {
    bookId: 'eob_nt_john',
    translationId: 'eob_nt',
    bookIndex: 4,
    bookName: 'John',
    bookAbbrev: 'john',
    testament: 'NT',
    chapterCount: 21,
  },
];

describe('BookNavigator', () => {
  it('renders the Navigate button', () => {
    render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    expect(screen.getByText('Navigate')).toBeInTheDocument();
  });

  it('does not show select elements before clicking Navigate', () => {
    render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows select elements after clicking Navigate', () => {
    render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    const button = screen.getByText('Navigate');
    fireEvent.click(button);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('book select has Old Testament optgroup after opening panel', () => {
    const { container } = render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    fireEvent.click(screen.getByText('Navigate'));
    const optgroups = container.querySelectorAll('optgroup');
    const otGroup = Array.from(optgroups).find((g) => g.label === 'Old Testament');
    expect(otGroup).toBeTruthy();
  });

  it('book select has New Testament optgroup after opening panel', () => {
    const { container } = render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    fireEvent.click(screen.getByText('Navigate'));
    const optgroups = container.querySelectorAll('optgroup');
    const ntGroup = Array.from(optgroups).find((g) => g.label === 'New Testament');
    expect(ntGroup).toBeTruthy();
  });

  it('aria-expanded is false before opening, true after opening', () => {
    render(
      <BookNavigator books={sampleBooks} currentBook="genesis" currentChapter={1} />
    );
    const button = screen.getByText('Navigate');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
