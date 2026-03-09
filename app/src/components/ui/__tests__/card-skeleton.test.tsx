import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardSkeleton } from '../card-skeleton';

describe('CardSkeleton', () => {
  it('renders list variant with correct number of rows', () => {
    const { container } = render(<CardSkeleton rows={3} variant="list" />);
    const rows = container.querySelectorAll('[role="status"] > div');
    expect(rows).toHaveLength(3);
  });

  it('renders grid variant with correct number of items', () => {
    const { container } = render(<CardSkeleton rows={2} variant="grid" />);
    const items = container.querySelectorAll('[role="status"] > div');
    expect(items).toHaveLength(2);
  });

  it('has animate-pulse class', () => {
    const { container } = render(<CardSkeleton />);
    const wrapper = container.querySelector('[role="status"]');
    expect(wrapper).toHaveClass('animate-pulse');
  });

  it('has accessible aria-label', () => {
    const { container } = render(<CardSkeleton />);
    const wrapper = container.querySelector('[role="status"]');
    expect(wrapper).toHaveAttribute('aria-label', 'Loading content...');
  });
});
