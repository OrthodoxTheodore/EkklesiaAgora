import { render, screen } from '@testing-library/react';
import { MemberCard } from '@/components/synodeia/MemberCard';
import type { SynodeiaMember } from '@/lib/firestore/synodeia';

const baseMember: SynodeiaMember = {
  uid: 'u1',
  handle: 'john_doe',
  displayName: 'John Doe',
  avatarUrl: null,
  jurisdictionId: 'oca',
  city: null,
  stateRegion: null,
};

describe('MemberCard', () => {
  it('renders display name and jurisdiction badge', () => {
    render(<MemberCard member={baseMember} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Orthodox Church in America (OCA)')).toBeInTheDocument();
  });

  it('shows city/state when provided', () => {
    render(<MemberCard member={{ ...baseMember, city: 'Atlanta', stateRegion: 'GA' }} />);
    expect(screen.getByText('Atlanta, GA')).toBeInTheDocument();
  });

  it('hides city/state when null', () => {
    render(<MemberCard member={baseMember} />);
    expect(screen.queryByText(/Atlanta/)).not.toBeInTheDocument();
  });

  it('renders avatar fallback initial when no avatarUrl', () => {
    render(<MemberCard member={baseMember} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
