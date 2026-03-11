import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { trpc } from '@/lib/api/react';
import DashboardPage from '../page';

vi.mock('@/lib/api/react', () => ({
  trpc: {
    useQueries: vi.fn(),
  },
}));

const mockUseQueries = trpc.useQueries as ReturnType<typeof vi.fn>;

describe('Dashboard Home - Loading States', () => {
  it('shows skeleton loaders in Recent Requests card while loading', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: true, error: null }, // recentRequests
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
    ]);

    render(<DashboardPage />);

    // Recent requests card shows skeleton placeholders in the content area while loading
    expect(screen.getByText('Recent Requests')).toBeInTheDocument();
    expect(screen.queryByText('No recent requests')).not.toBeInTheDocument();
  });

  it('shows skeleton loaders in Pending Approvals card while loading', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: true, error: null }, // pendingApprovals
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
    ]);

    render(<DashboardPage />);

    // Pending approvals card shows skeleton placeholders in the content area while loading
    expect(screen.getByText('Action Required')).toBeInTheDocument();
    expect(screen.queryByText('No pending approvals')).not.toBeInTheDocument();
  });

  it('shows InlineLoader in StatCard while loading', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined, isLoading: true, error: null }, // stats
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
    ]);

    render(<DashboardPage />);

    const statCards = screen.getAllByRole('status', { name: /loading/i });
    expect(statCards.length).toBeGreaterThan(0);
  });
});
