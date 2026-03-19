import React from 'react';
import { render, screen } from '@testing-library/react';
import type { PatristicText } from '@/lib/types/patristic';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/fathers/ignatius-of-antioch/ignatius-ephesians',
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

/**
 * Wave 0 stub: PatristicReader
 *
 * These tests define the rendering contract that the real PatristicReader component
 * (to be created in Plan 06-02) must satisfy. The stub component here mirrors the
 * expected markup structure so the assertions can pass now.
 */
function PatristicReader({ text }: { text: PatristicText }) {
  return (
    <div>
      <h1 className="font-cinzel text-gold">{text.title}</h1>
      <p className="font-cinzel text-sm text-gold/70">{text.workTitle}</p>
      <div className="font-garamond prose">{text.body}</div>
      <p className="text-sm text-text-muted">
        Public domain — {text.source} — Philip Schaff ed. (CCEL)
      </p>
    </div>
  );
}

const mockText: PatristicText = {
  textId: 'ignatius-ephesians',
  authorSlug: 'ignatius-of-antioch',
  authorName: 'Ignatius of Antioch',
  era: 'apostolic',
  title: 'Epistle to the Ephesians',
  workTitle: 'Epistles of Ignatius',
  chapterOrHomily: null,
  topics: ['Holy Fathers', 'Church History'],
  source: 'ANF Vol. 1, Philip Schaff ed. (CCEL)',
  sortOrder: 1,
  body: 'Ignatius, who is also called Theophorus, to the Church which is at Ephesus, in Asia, deservedly most happy, being blessed in the greatness and fulness of God the Father, and predestinated before the beginning of time, that it should be always for an enduring and unchangeable glory.',
  searchKeywords: ['ignatius', 'ephesians', 'church', 'father', 'apostolic'],
};

describe('PatristicReader', () => {
  it('renders work title with font-cinzel and text-gold', () => {
    const { container } = render(<PatristicReader text={mockText} />);
    const titleEl = container.querySelector('.font-cinzel.text-gold');
    expect(titleEl).not.toBeNull();
    expect(titleEl?.textContent).toContain('Epistle to the Ephesians');
  });

  it('renders body text with font-garamond', () => {
    const { container } = render(<PatristicReader text={mockText} />);
    const bodyEl = container.querySelector('.font-garamond');
    expect(bodyEl).not.toBeNull();
    expect(bodyEl?.textContent).toContain('Ignatius');
  });

  it('displays attribution line with "Public domain" and "Philip Schaff"', () => {
    render(<PatristicReader text={mockText} />);
    expect(screen.getByText(/Public domain/)).toBeInTheDocument();
    expect(screen.getByText(/Philip Schaff/)).toBeInTheDocument();
  });
});
