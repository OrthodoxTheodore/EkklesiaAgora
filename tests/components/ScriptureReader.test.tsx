import { render, screen } from '@testing-library/react';
import { ScriptureReader } from '@/components/scripture/ScriptureReader';
import type { ScriptureVerse, ScriptureBook } from '@/lib/types/scripture';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock child components to isolate ScriptureReader rendering
jest.mock('@/components/scripture/BookNavigator', () => ({
  BookNavigator: () => <div data-testid="book-navigator" />,
}));

jest.mock('@/components/scripture/VerseList', () => ({
  VerseList: ({ verses }: { verses: ScriptureVerse[] }) => (
    <div data-testid="verse-list" className="font-garamond">
      {verses.map((v) => (
        <span key={v.verseId} id={`verse-${v.verse}`}>
          <sup>{v.verse}</sup>
          <span className="font-garamond text-lg text-text-light">{v.text} </span>
        </span>
      ))}
    </div>
  ),
}));

const sampleVerses: ScriptureVerse[] = [
  {
    verseId: 'test_gen_1_1',
    translationId: 'brenton',
    testament: 'OT',
    bookIndex: 1,
    bookName: 'Genesis',
    bookAbbrev: 'genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning God created the heaven and the earth.',
    searchKeywords: ['the', 'beginning', 'god', 'created', 'heaven', 'earth'],
  },
  {
    verseId: 'test_gen_1_2',
    translationId: 'brenton',
    testament: 'OT',
    bookIndex: 1,
    bookName: 'Genesis',
    bookAbbrev: 'genesis',
    chapter: 1,
    verse: 2,
    text: 'But the earth was unsightly and unfurnished.',
    searchKeywords: ['but', 'the', 'earth', 'was', 'unsightly'],
  },
];

const sampleBookMeta: ScriptureBook = {
  bookId: 'brenton_genesis',
  translationId: 'brenton',
  bookIndex: 1,
  bookName: 'Genesis',
  bookAbbrev: 'genesis',
  testament: 'OT',
  chapterCount: 50,
};

const sampleNTBookMeta: ScriptureBook = {
  bookId: 'eob_nt_john',
  translationId: 'eob_nt',
  bookIndex: 4,
  bookName: 'John',
  bookAbbrev: 'john',
  testament: 'NT',
  chapterCount: 21,
};

describe('ScriptureReader', () => {
  it('renders verse text "In the beginning"', () => {
    render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.getByText(/In the beginning/)).toBeInTheDocument();
  });

  it('verse number 1 appears as a superscript element', () => {
    const { container } = render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    const supElements = container.querySelectorAll('sup');
    const verseNumbers = Array.from(supElements).map((s) => s.textContent);
    expect(verseNumbers).toContain('1');
  });

  // LIB-03 gate: Byzantine aesthetic rendering assertion
  it('verse text container has font-garamond class (LIB-03 Byzantine rendering)', () => {
    const { container } = render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    const garamondEl = container.querySelector('.font-garamond');
    expect(garamondEl).not.toBeNull();
  });

  it('does NOT show "Previous Chapter" link when currentChapter is 1', () => {
    render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.queryByText(/Previous Chapter/)).not.toBeInTheDocument();
  });

  it('shows "Next Chapter" link when not on final chapter', () => {
    render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.getByText(/Next Chapter/)).toBeInTheDocument();
  });

  it('does NOT show "Next Chapter" link on the final chapter', () => {
    render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={50}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.queryByText(/Next Chapter/)).not.toBeInTheDocument();
  });

  it('shows EOB attribution for NT chapters', () => {
    const ntVerses = sampleVerses.map((v) => ({
      ...v,
      testament: 'NT' as const,
      translationId: 'eob_nt',
      bookName: 'John',
      bookAbbrev: 'john',
      bookIndex: 4,
    }));
    render(
      <ScriptureReader
        initialVerses={ntVerses}
        bookMeta={sampleNTBookMeta}
        currentChapter={3}
        allBooks={[sampleNTBookMeta]}
      />
    );
    // Check specifically for the EOB attribution paragraph (not just the testament label)
    expect(
      screen.getByText(/Patriarchal Text of 1904/)
    ).toBeInTheDocument();
  });

  it('does NOT show EOB attribution for OT chapters', () => {
    render(
      <ScriptureReader
        initialVerses={sampleVerses}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.queryByText(/Eastern Orthodox Bible/)).not.toBeInTheDocument();
  });

  it('shows error state when no verses provided', () => {
    render(
      <ScriptureReader
        initialVerses={[]}
        bookMeta={sampleBookMeta}
        currentChapter={1}
        allBooks={[sampleBookMeta]}
      />
    );
    expect(screen.getByText(/could not be loaded/)).toBeInTheDocument();
  });
});
