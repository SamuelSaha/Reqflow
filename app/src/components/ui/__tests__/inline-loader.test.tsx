import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InlineLoader } from '../inline-loader';

describe('InlineLoader', () => {
  it('renders spinner only when no text provided', () => {
    const { container } = render(<InlineLoader />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('role', 'status');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with custom text when provided', () => {
    render(<InlineLoader text="Saving..." />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders spinner with text in inline-flex layout when text provided', () => {
    const { container } = render(<InlineLoader text="Loading..." />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('inline-flex', 'items-center', 'gap-2');
  });

  it('accepts size prop', () => {
    const { container } = render(<InlineLoader size="md" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6'); // md size
  });
});
