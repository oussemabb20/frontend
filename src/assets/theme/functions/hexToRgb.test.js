import { describe, it, expect } from 'vitest';
import hexToRgb from './hexToRgb';

describe('hexToRgb utility function', () => {
  it('should convert hex color to RGB string', () => {
    expect(hexToRgb('#ffffff')).toBe('255, 255, 255');
  });

  it('should convert black hex to RGB', () => {
    expect(hexToRgb('#000000')).toBe('0, 0, 0');
  });

  it('should convert red hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toBe('255, 0, 0');
  });

  it('should convert green hex to RGB', () => {
    expect(hexToRgb('#00ff00')).toBe('0, 255, 0');
  });

  it('should convert blue hex to RGB', () => {
    expect(hexToRgb('#0000ff')).toBe('0, 0, 255');
  });

  it('should handle 3-character hex codes', () => {
    expect(hexToRgb('#fff')).toBe('255, 255, 255');
    expect(hexToRgb('#000')).toBe('0, 0, 0');
  });

  it('should handle hex without hash symbol', () => {
    expect(hexToRgb('ffffff')).toBe('255, 255, 255');
  });

  it('should convert primary brand color', () => {
    expect(hexToRgb('#4318ff')).toBe('67, 24, 255');
  });

  it('should convert secondary color', () => {
    expect(hexToRgb('#0f1535')).toBe('15, 21, 53');
  });

  it('should handle various color formats', () => {
    expect(hexToRgb('#a0aec0')).toBe('160, 174, 192');
    expect(hexToRgb('#01b574')).toBe('1, 181, 116');
  });
});
