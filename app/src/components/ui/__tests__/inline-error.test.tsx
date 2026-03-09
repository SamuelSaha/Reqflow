import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InlineError } from '../inline-error';

describe('InlineError', () => {
  it('renders error message', () => {
    render(<InlineError message="Vendor name is required" />);
    expect(screen.getByText('Vendor name is required')).toBeInTheDocument();
  });

  it('renders AlertCircle icon', () => {
    const { container } = render(<InlineError message="Error" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has red text color', () => {
    const { container } = render(<InlineError message="Error" />);
    const text = screen.getByText('Error');
    expect(text).toHaveClass('text-red-600');
  });

  it('has role="alert"', () => {
    const { container } = render(<InlineError message="Error" />);
    const wrapper = container.querySelector('[role="alert"]');
    expect(wrapper).toBeInTheDocument();
  });
});
