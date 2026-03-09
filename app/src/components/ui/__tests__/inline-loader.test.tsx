import { render, screen } from '@testing-library/react';
import { InlineLoader } from '../inline-loader';

describe('InlineLoader', () => {
  it('renders with default text', () => {
    render(<InlineLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<InlineLoader text="Saving..." />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders spinner', () => {
    const { container } = render(<InlineLoader />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('uses inline-flex layout', () => {
    const { container } = render(<InlineLoader />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('inline-flex', 'items-center', 'gap-2');
  });
});
