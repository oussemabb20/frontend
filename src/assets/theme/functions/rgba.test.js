import { describe, it, expect } from 'vitest';
import rgba from './rgba';

describe('rgba utility function', () => {
  it('should create rgba color with full opacity', () => {
    expect(rgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  it('should create rgba color with half opacity', () => {
    expect(rgba('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('should create rgba color with zero opacity', () => {
    expect(rgba('#ff0000', 0)).toBe('rgba(255, 0, 0, 0)');
  });

  it('should handle decimal opacity values', () => {
    expect(rgba('#0000ff', 0.75)).toBe('rgba(0, 0, 255, 0.75)');
  });

  it('should work with 3-character hex codes', () => {
    expect(rgba('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('should create rgba for primary color', () => {
    expect(rgba('#4318ff', 0.8)).toBe('rgba(67, 24, 255, 0.8)');
  });

  it('should create rgba for success color', () => {
    expect(rgba('#01b574', 0.3)).toBe('rgba(1, 181, 116, 0.3)');
  });

  it('should create rgba for error color', () => {
    expect(rgba('#e31a1a', 0.9)).toBe('rgba(227, 26, 26, 0.9)');
  });

  it('should handle very low opacity', () => {
    expect(rgba('#ffffff', 0.01)).toBe('rgba(255, 255, 255, 0.01)');
  });

  it('should handle various opacity levels', () => {
    expect(rgba('#a0aec0', 0.25)).toBe('rgba(160, 174, 192, 0.25)');
    expect(rgba('#a0aec0', 0.6)).toBe('rgba(160, 174, 192, 0.6)');
  });
});
