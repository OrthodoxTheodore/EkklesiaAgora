import React from 'react';
import { render, screen } from '@testing-library/react';
import type { StudyGuide } from '@/lib/types/patristic';

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
 * Wave 0 stub: StudyGuideViewer
 *
 * These tests define the rendering contract that the real StudyGuideViewer component
 * (to be created in Plan 06-02) must satisfy. The stub component here mirrors the
 * expected markup structure so the assertions can pass now.
 */
function StudyGuideViewer({ guide }: { guide: StudyGuide }) {
  return (
    <div>
      <h1 className="font-cinzel text-gold">{guide.title}</h1>
      <p className="font-garamond">{guide.description}</p>
      <ol>
        {guide.items.map((item) => (
          <li key={item.step}>
            <span className="step-number">{item.step}</span>
            <span className="font-cinzel">{item.title}</span>
            <p className="font-garamond">{item.description}</p>
            {item.type === 'scripture' && item.href ? (
              <a href={item.href} className="text-gold hover:underline">
                {item.title}
              </a>
            ) : (
              <a
                href={`/fathers/${item.refId}`}
                className="text-gold hover:underline"
              >
                {item.title}
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

const mockGuide: StudyGuide = {
  guideId: 'introduction-to-orthodoxy',
  slug: 'introduction-to-orthodoxy',
  title: 'Introduction to Orthodoxy',
  description:
    'A curated reading path for those beginning their journey into Orthodox Christianity.',
  topic: 'Church History',
  items: [
    {
      step: 1,
      title: 'Epistle to the Ephesians by Ignatius',
      description:
        "Begin with Ignatius of Antioch's letter to the Ephesians, a foundational text on Church unity.",
      type: 'patristic',
      refId: 'ignatius-ephesians',
      href: null,
    },
    {
      step: 2,
      title: 'John 1:1-18 — The Prologue',
      description:
        'Read the Johannine Prologue, the scriptural foundation for Orthodox Christology.',
      type: 'scripture',
      refId: null,
      href: '/scripture/john/1#verse-1',
    },
    {
      step: 3,
      title: 'On the Incarnation by Athanasius',
      description:
        "Athanasius's classic work explaining why God became man — essential Orthodox theology.",
      type: 'patristic',
      refId: 'athanasius-incarnation',
      href: null,
    },
  ],
};

describe('StudyGuideViewer', () => {
  it('renders all steps in order', () => {
    render(<StudyGuideViewer guide={mockGuide} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('scripture items link to /scripture/ path', () => {
    render(<StudyGuideViewer guide={mockGuide} />);
    const links = screen.getAllByRole('link');
    const scriptureLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/scripture/')
    );
    expect(scriptureLinks.length).toBeGreaterThan(0);
  });

  it('patristic items link to /fathers/ path', () => {
    render(<StudyGuideViewer guide={mockGuide} />);
    const links = screen.getAllByRole('link');
    const patristicLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/fathers/')
    );
    expect(patristicLinks.length).toBeGreaterThan(0);
  });

  it('displays step numbers 1, 2, 3', () => {
    render(<StudyGuideViewer guide={mockGuide} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
