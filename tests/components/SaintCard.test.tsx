import { render, screen, fireEvent } from '@testing-library/react';
import { SaintCard } from '@/components/calendar/SaintCard';
import type { SaintStory } from '@/lib/types/calendar';

const mockStory: SaintStory = {
  title: 'Forty-two Martyrs of Ammoria (845)',
  story: '<p>These holy martyrs suffered for the faith in ancient Ammoria.</p>',
};

describe('SaintCard', () => {
  it('renders saint name in collapsed state', () => {
    render(<SaintCard story={mockStory} feastLevel={0} />);
    expect(screen.getByText('Forty-two Martyrs of Ammoria (845)')).toBeInTheDocument();
  });

  it('expands to show full story on click', () => {
    render(<SaintCard story={mockStory} feastLevel={0} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    // The full story HTML content is rendered when expanded
    expect(screen.getByText(/These holy martyrs suffered for the faith/)).toBeInTheDocument();
  });

  it('collapses on second click', () => {
    render(<SaintCard story={mockStory} feastLevel={0} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
