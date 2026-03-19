import { render, screen } from '@testing-library/react';
import { parseReference, ScriptureSearch } from '@/components/scripture/ScriptureSearch';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock the Server Action
jest.mock('@/lib/actions/scripture', () => ({
  searchScripture: jest.fn().mockResolvedValue([]),
}));

// Mock BOOK_ABBREV_MAP with key entries
jest.mock('@/lib/types/scripture', () => ({
  BOOK_ABBREV_MAP: {
    John: { slug: 'john', name: 'John', testament: 'NT', index: 4 },
    Genesis: { slug: 'genesis', name: 'Genesis', testament: 'OT', index: 1 },
    '1 Kings': { slug: '1-kings', name: '1 Kings', testament: 'OT', index: 11 },
    Romans: { slug: 'romans', name: 'Romans', testament: 'NT', index: 6 },
  },
}));

describe('parseReference', () => {
  it('parses "John 3:16" correctly', () => {
    const result = parseReference('John 3:16');
    expect(result).not.toBeNull();
    expect(result?.book).toBe('John');
    expect(result?.chapter).toBe(3);
    expect(result?.verse).toBe(16);
    expect(result?.slug).toBe('john');
  });

  it('parses "Genesis 1" without verse', () => {
    const result = parseReference('Genesis 1');
    expect(result).not.toBeNull();
    expect(result?.book).toBe('Genesis');
    expect(result?.chapter).toBe(1);
    expect(result?.verse).toBeUndefined();
  });

  it('returns null for "not a reference"', () => {
    const result = parseReference('not a reference');
    expect(result).toBeNull();
  });

  it('parses "1 Kings 8:22" correctly', () => {
    const result = parseReference('1 Kings 8:22');
    expect(result).not.toBeNull();
    expect(result?.book).toBe('1 Kings');
    expect(result?.chapter).toBe(8);
    expect(result?.verse).toBe(22);
  });
});

describe('ScriptureSearch component', () => {
  it('renders search input with correct placeholder', () => {
    render(<ScriptureSearch />);
    expect(
      screen.getByPlaceholderText('Search Scripture (e.g., grace, John 3:16)')
    ).toBeInTheDocument();
  });

  it('renders Search button', () => {
    render(<ScriptureSearch />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders Search Scripture label', () => {
    render(<ScriptureSearch />);
    expect(screen.getByText('Search Scripture')).toBeInTheDocument();
  });
});
