import { describe, it, expect } from 'vitest';
import colors from './colors';

describe('Theme Colors Configuration', () => {
  describe('Basic Colors', () => {
    it('should have background color defined', () => {
      expect(colors.background).toBeDefined();
      expect(colors.background.default).toBe('#f8f9fa');
    });

    it('should have white color defined', () => {
      expect(colors.white).toBeDefined();
      expect(colors.white.main).toBe('#ffffff');
      expect(colors.white.focus).toBe('#ffffff');
    });

    it('should have black color defined', () => {
      expect(colors.black).toBeDefined();
      expect(colors.black.main).toBe('#000000');
      expect(colors.black.light).toBe('#141414');
    });

    it('should have transparent color', () => {
      expect(colors.transparent.main).toBe('transparent');
    });
  });

  describe('Brand Colors', () => {
    it('should have primary color', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary.main).toBe('#4318ff');
      expect(colors.primary.focus).toBe('#9f7aea');
    });

    it('should have secondary color', () => {
      expect(colors.secondary).toBeDefined();
      expect(colors.secondary.main).toBe('#0f1535');
      expect(colors.secondary.focus).toBe('#131538');
    });

    it('should have brand color', () => {
      expect(colors.brand).toBeDefined();
      expect(colors.brand.main).toBe('#0075ff');
    });
  });

  describe('Semantic Colors', () => {
    it('should have info color', () => {
      expect(colors.info).toBeDefined();
      expect(colors.info.main).toBe('#0075ff');
      expect(colors.info.focus).toBe('#3993fe');
    });

    it('should have success color', () => {
      expect(colors.success).toBeDefined();
      expect(colors.success.main).toBe('#01b574');
      expect(colors.success.focus).toBe('#35d28a');
    });

    it('should have warning color', () => {
      expect(colors.warning).toBeDefined();
      expect(colors.warning.main).toBe('#ffb547');
      expect(colors.warning.focus).toBe('#ffcd75');
    });

    it('should have error color', () => {
      expect(colors.error).toBeDefined();
      expect(colors.error.main).toBe('#e31a1a');
      expect(colors.error.focus).toBe('#ee5d50');
    });
  });

  describe('Grey Scale', () => {
    it('should have complete grey scale', () => {
      expect(colors.grey).toBeDefined();
      expect(colors.grey[100]).toBe('#edf2f7');
      expect(colors.grey[200]).toBe('#e2e8f0');
      expect(colors.grey[300]).toBe('#cbd5e0');
      expect(colors.grey[400]).toBe('#a0aec0');
      expect(colors.grey[500]).toBe('#718096');
      expect(colors.grey[600]).toBe('#4a5568');
      expect(colors.grey[700]).toBe('#2d3748');
      expect(colors.grey[800]).toBe('#1a202a');
      expect(colors.grey[900]).toBe('#171923');
    });
  });

  describe('Text Colors', () => {
    it('should have text colors', () => {
      expect(colors.text).toBeDefined();
      expect(colors.text.main).toBe('#a0aec0');
      expect(colors.text.focus).toBe('#ffffff');
    });
  });

  describe('Gradients', () => {
    it('should have primary gradient', () => {
      expect(colors.gradients.primary).toBeDefined();
      expect(colors.gradients.primary.deg).toBe('97.89');
      expect(colors.gradients.primary.main).toBe('#4318ff');
      expect(colors.gradients.primary.state).toBe('#9f7aea');
    });

    it('should have info gradient', () => {
      expect(colors.gradients.info).toBeDefined();
      expect(colors.gradients.info.main).toBe('#0075ff');
      expect(colors.gradients.info.state).toBe('#21d4fd');
    });

    it('should have success gradient', () => {
      expect(colors.gradients.success).toBeDefined();
      expect(colors.gradients.success.main).toBe('#01B574');
      expect(colors.gradients.success.state).toBe('#c9fbd5');
    });

    it('should have card gradient', () => {
      expect(colors.gradients.card).toBeDefined();
      expect(colors.gradients.card.deg).toBe('127.09');
    });

    it('should have sidenav gradient', () => {
      expect(colors.gradients.sidenav).toBeDefined();
      expect(colors.gradients.sidenav.deg).toBe('127.09');
    });
  });

  describe('Social Media Colors', () => {
    it('should have facebook colors', () => {
      expect(colors.socialMediaColors.facebook).toBeDefined();
      expect(colors.socialMediaColors.facebook.main).toBe('#3b5998');
      expect(colors.socialMediaColors.facebook.dark).toBe('#344e86');
    });

    it('should have twitter colors', () => {
      expect(colors.socialMediaColors.twitter).toBeDefined();
      expect(colors.socialMediaColors.twitter.main).toBe('#55acee');
    });

    it('should have github colors', () => {
      expect(colors.socialMediaColors.github).toBeDefined();
      expect(colors.socialMediaColors.github.main).toBe('#24292e');
    });
  });

  describe('Alert Colors', () => {
    it('should have alert colors for all semantic types', () => {
      expect(colors.alertColors.info).toBeDefined();
      expect(colors.alertColors.info.main).toBeDefined();
      expect(colors.alertColors.info.state).toBeDefined();
      expect(colors.alertColors.info.border).toBeDefined();

      expect(colors.alertColors.success).toBeDefined();
      expect(colors.alertColors.warning).toBeDefined();
      expect(colors.alertColors.error).toBeDefined();
    });
  });

  describe('Badge Colors', () => {
    it('should have badge colors with basic, background, and text', () => {
      expect(colors.badgeColors.primary).toBeDefined();
      expect(colors.badgeColors.primary.basic).toBe('#805ad5');
      expect(colors.badgeColors.primary.background).toBe('#f883dd');
      expect(colors.badgeColors.primary.text).toBe('#a3017e');
    });

    it('should have badge colors for all semantic types', () => {
      expect(colors.badgeColors.info).toBeDefined();
      expect(colors.badgeColors.success).toBeDefined();
      expect(colors.badgeColors.warning).toBeDefined();
      expect(colors.badgeColors.error).toBeDefined();
    });
  });

  describe('Input Colors', () => {
    it('should have input colors defined', () => {
      expect(colors.inputColors).toBeDefined();
      expect(colors.inputColors.backgroundColor).toBe('#0f1535');
      expect(colors.inputColors.borderColor.main).toBe('rgba(226, 232, 240, 0.3)');
      expect(colors.inputColors.borderColor.focus).toBe('rgba(226, 232, 240, 0.6)');
      expect(colors.inputColors.error).toBe('#fd5c70');
      expect(colors.inputColors.success).toBe('#66d432');
    });
  });

  describe('Border Colors', () => {
    it('should have border colors', () => {
      expect(colors.borderCol).toBeDefined();
      expect(colors.borderCol.main).toBe('#56577a');
      expect(colors.borderCol.red).toBe('#e31a1a');
      expect(colors.borderCol.navbar).toBe('rgba(226, 232, 240, 0.3)');
    });
  });

  describe('Info Chart Colors', () => {
    it('should have info chart color variations', () => {
      expect(colors.info.charts).toBeDefined();
      expect(colors.info.charts[100]).toBe('#2d8cfc');
      expect(colors.info.charts[200]).toBe('#2370cc');
      expect(colors.info.charts[300]).toBe('#2370cc');
      expect(colors.info.charts[400]).toBe('#0f4a91');
      expect(colors.info.charts[500]).toBe('#073a78');
      expect(colors.info.charts[600]).toBe('#012654');
    });
  });

  describe('Dark Mode Colors', () => {
    it('should have dark mode specific colors', () => {
      expect(colors.dark).toBeDefined();
      expect(colors.dark.main).toBe('#344767');
      expect(colors.dark.focus).toBe('#121241');
      expect(colors.dark.body).toBe('#030c1d');
    });
  });

  describe('Additional Colors', () => {
    it('should have lightblue color', () => {
      expect(colors.lightblue).toBeDefined();
      expect(colors.lightblue.main).toBe('#4299e1');
    });

    it('should have orange color', () => {
      expect(colors.orange).toBeDefined();
      expect(colors.orange.main).toBe('#f6ad55');
    });

    it('should have sidenav button color', () => {
      expect(colors.sidenav).toBeDefined();
      expect(colors.sidenav.button).toBe('#1a1f37');
    });
  });
});
