import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from '../avatar-group';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('AvatarGroup', () => {
  it('renders all avatars when count <= max', () => {
    const { container } = render(
      <AvatarGroup max={3}>
        <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>SS</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    const avatars = container.querySelectorAll('[data-avatar]');
    expect(avatars).toHaveLength(2);
  });

  it('shows overflow indicator when count > max', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>SS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AK</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>MJ</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('displays only max avatars when overflow', () => {
    const { container } = render(
      <AvatarGroup max={2}>
        <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>SS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AK</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    const avatars = container.querySelectorAll('[data-avatar]');
    expect(avatars).toHaveLength(2); // Only first 2 shown
  });
});
