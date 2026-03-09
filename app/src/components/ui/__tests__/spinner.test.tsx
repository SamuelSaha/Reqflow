import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '../spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6'); // md = 24px
  });

  it('renders with small size', () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4'); // sm = 16px
  });

  it('renders with large size', () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8'); // lg = 32px
  });

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin');
  });
});
