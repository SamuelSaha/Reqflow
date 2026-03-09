import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarColor } from '../avatar';

describe('getInitials', () => {
  it('returns first and last initial', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Sam Saha')).toBe('SS');
  });

  it('returns first initial for single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('returns first two initials for long names', () => {
    expect(getInitials('John Paul Jones')).toBe('JJ');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('getAvatarColor', () => {
  it('returns consistent color for same ID', () => {
    const color1 = getAvatarColor('user-123');
    const color2 = getAvatarColor('user-123');
    expect(color1).toBe(color2);
  });

  it('returns one of the 8 predefined colors', () => {
    const validColors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
      'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    const color = getAvatarColor('user-456');
    expect(validColors).toContain(color);
  });

  it('distributes different IDs across colors', () => {
    const colors = new Set();
    for (let i = 0; i < 20; i++) {
      colors.add(getAvatarColor(`user-${i}`));
    }
    // Should use more than 1 color across 20 users
    expect(colors.size).toBeGreaterThan(1);
  });
});
