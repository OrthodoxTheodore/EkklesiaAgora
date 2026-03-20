import React from 'react';
import { render, screen } from '@testing-library/react';
import { PatristicReader } from '@/components/fathers/PatristicReader';
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

const mockPrevText: PatristicText = {
  ...mockText,
  textId: 'ignatius-romans',
  title: 'Epistle to the Romans',
  sortOrder: 0,
};

const mockNextText: PatristicText = {
  ...mockText,
  textId: 'ignatius-trallians',
  title: 'Epistle to the Trallians',
  sortOrder: 2,
};

describe('PatristicReader', () => {
  it('renders work title with font-cinzel and text-gold', () => {
    const { container } = render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={null} />
    );
    const titleEl = container.querySelector('.font-cinzel.text-gold');
    expect(titleEl).not.toBeNull();
    expect(titleEl?.textContent).toContain('Epistle to the Ephesians');
  });

  it('renders body text with font-garamond', () => {
    const { container } = render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={null} />
    );
    const articleEl = container.querySelector('article.font-garamond');
    expect(articleEl).not.toBeNull();
    expect(articleEl?.textContent).toContain('Ignatius');
  });

  it('displays attribution line with "Public domain" and "Philip Schaff"', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={null} />
    );
    expect(screen.getByText(/Public domain/)).toBeInTheDocument();
    expect(screen.getByText(/Philip Schaff/)).toBeInTheDocument();
  });

  it('renders breadcrumb with "Church Fathers" link', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={null} />
    );
    const churchFathersLink = screen.getByRole('link', { name: /Church Fathers/ });
    expect(churchFathersLink).toBeInTheDocument();
    expect(churchFathersLink).toHaveAttribute('href', '/fathers');
  });

  it('does not show prev/next navigation when both are null', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={null} />
    );
    expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument();
  });

  it('shows prev navigation when prevText is provided', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={mockPrevText} nextText={null} />
    );
    expect(screen.getByText(/Previous/)).toBeInTheDocument();
  });

  it('shows next navigation when nextText is provided', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={mockNextText} />
    );
    expect(screen.getByText(/Next/)).toBeInTheDocument();
  });

  it('prev link points to correct textId URL', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={mockPrevText} nextText={null} />
    );
    const prevLink = screen.getByText(/Previous/).closest('a');
    expect(prevLink).toHaveAttribute('href', '/fathers/ignatius-of-antioch/ignatius-romans');
  });

  it('next link points to correct textId URL', () => {
    render(
      <PatristicReader text={mockText} authorSlug="ignatius-of-antioch" prevText={null} nextText={mockNextText} />
    );
    const nextLink = screen.getByText(/Next/).closest('a');
    expect(nextLink).toHaveAttribute('href', '/fathers/ignatius-of-antioch/ignatius-trallians');
  });
});
