import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLoader } from '../page-loader';

describe('PageLoader', () => {
  it('renders with default message', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoader message="Loading contracts..." />);
    expect(screen.getByText('Loading contracts...')).toBeInTheDocument();
  });

  it('renders spinner', () => {
    const { container } = render(<PageLoader />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('centers content', () => {
    const { container } = render(<PageLoader />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
