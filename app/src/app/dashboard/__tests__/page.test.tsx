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
  it('shows InlineLoader in Recent Requests card header while loading', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: true, error: null }, // recentRequests
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
    ]);

    render(<DashboardPage />);

    const cardHeader = screen.getByText('Recent Requests').closest('div');
    expect(cardHeader).toContainElement(screen.getByRole('status', { name: /loading/i }));
  });

  it('shows InlineLoader in Pending Approvals card header while loading', () => {
    mockUseQueries.mockReturnValue([
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: true, error: null }, // pendingApprovals
      { data: undefined, isLoading: false, error: null },
      { data: undefined, isLoading: false, error: null },
    ]);

    render(<DashboardPage />);

    const cardHeader = screen.getByText('Action Required').closest('div');
    expect(cardHeader).toContainElement(screen.getByRole('status', { name: /loading/i }));
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
