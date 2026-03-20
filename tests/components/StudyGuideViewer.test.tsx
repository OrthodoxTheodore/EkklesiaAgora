import React from 'react';
import { render, screen } from '@testing-library/react';
import { StudyGuideViewer } from '@/components/fathers/StudyGuideViewer';
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

// resolvedLinks maps patristic refIds to their full /fathers/... URL paths
const mockResolvedLinks: Record<string, string> = {
  'ignatius-ephesians': '/fathers/ignatius-of-antioch/ignatius-ephesians',
  'athanasius-incarnation': '/fathers/athanasius-of-alexandria/athanasius-incarnation',
};

describe('StudyGuideViewer', () => {
  it('renders all steps in order', () => {
    render(<StudyGuideViewer guide={mockGuide} resolvedLinks={mockResolvedLinks} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('scripture items link to /scripture/ path', () => {
    render(<StudyGuideViewer guide={mockGuide} resolvedLinks={mockResolvedLinks} />);
    const links = screen.getAllByRole('link');
    const scriptureLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/scripture/')
    );
    expect(scriptureLinks.length).toBeGreaterThan(0);
  });

  it('patristic items link to /fathers/ path', () => {
    render(<StudyGuideViewer guide={mockGuide} resolvedLinks={mockResolvedLinks} />);
    const links = screen.getAllByRole('link');
    const patristicLinks = links.filter((link) =>
      link.getAttribute('href')?.startsWith('/fathers/')
    );
    expect(patristicLinks.length).toBeGreaterThan(0);
  });

  it('displays step numbers 1, 2, 3', () => {
    render(<StudyGuideViewer guide={mockGuide} resolvedLinks={mockResolvedLinks} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
  });
});
