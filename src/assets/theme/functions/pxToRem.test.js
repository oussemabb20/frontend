import { describe, it, expect } from 'vitest';
import pxToRem from './pxToRem';

describe('pxToRem utility function', () => {
  it('should convert pixels to rem with default base (16)', () => {
    expect(pxToRem(16)).toBe('1rem');
  });

  it('should convert pixels to rem with custom base', () => {
    expect(pxToRem(20, 10)).toBe('2rem');
  });

  it('should handle zero value', () => {
    expect(pxToRem(0)).toBe('0rem');
  });

  it('should handle decimal values', () => {
    expect(pxToRem(24)).toBe('1.5rem');
  });

  it('should handle large values', () => {
    expect(pxToRem(256)).toBe('16rem');
  });

  it('should handle small values', () => {
    expect(pxToRem(8)).toBe('0.5rem');
  });

  it('should handle negative values', () => {
    expect(pxToRem(-16)).toBe('-1rem');
  });

  it('should handle fractional pixel values', () => {
    expect(pxToRem(12.5)).toBe('0.78125rem');
  });

  it('should work with different base numbers', () => {
    expect(pxToRem(32, 32)).toBe('1rem');
    expect(pxToRem(10, 20)).toBe('0.5rem');
  });
});
