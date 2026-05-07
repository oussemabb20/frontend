import { describe, it, expect } from 'vitest';
import linearGradient from './linearGradient';

describe('linearGradient utility function', () => {
  it('should create linear gradient with default angle (310deg)', () => {
    const result = linearGradient('#4318ff', '#9f7aea');
    expect(result).toBe('linear-gradient(310deg, #4318ff, #9f7aea)');
  });

  it('should create linear gradient with custom angle', () => {
    const result = linearGradient('#ff0000', '#00ff00', 90);
    expect(result).toBe('linear-gradient(90deg, #ff0000, #00ff00)');
  });

  it('should handle 0 degree angle', () => {
    const result = linearGradient('#000000', '#ffffff', 0);
    expect(result).toBe('linear-gradient(0deg, #000000, #ffffff)');
  });

  it('should handle 180 degree angle', () => {
    const result = linearGradient('#0075ff', '#21d4fd', 180);
    expect(result).toBe('linear-gradient(180deg, #0075ff, #21d4fd)');
  });

  it('should handle 360 degree angle', () => {
    const result = linearGradient('#01b574', '#c9fbd5', 360);
    expect(result).toBe('linear-gradient(360deg, #01b574, #c9fbd5)');
  });

  it('should create gradient for primary colors', () => {
    const result = linearGradient('#4318ff', '#9f7aea', 97.89);
    expect(result).toBe('linear-gradient(97.89deg, #4318ff, #9f7aea)');
  });

  it('should create gradient for info colors', () => {
    const result = linearGradient('#0075ff', '#21d4fd');
    expect(result).toBe('linear-gradient(310deg, #0075ff, #21d4fd)');
  });

  it('should create gradient for success colors', () => {
    const result = linearGradient('#01B574', '#c9fbd5');
    expect(result).toBe('linear-gradient(310deg, #01B574, #c9fbd5)');
  });

  it('should handle negative angles', () => {
    const result = linearGradient('#ffffff', '#000000', -45);
    expect(result).toBe('linear-gradient(-45deg, #ffffff, #000000)');
  });

  it('should work with rgba colors', () => {
    const result = linearGradient('rgba(255, 255, 255, 0.5)', 'rgba(0, 0, 0, 0.5)', 45);
    expect(result).toBe('linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5))');
  });
});
