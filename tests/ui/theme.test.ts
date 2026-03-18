import '@testing-library/jest-dom';
import * as fs from 'fs';
import * as path from 'path';

describe('Byzantine theme (DES-01)', () => {
  let css: string;

  beforeAll(() => {
    css = fs.readFileSync(
      path.resolve(process.cwd(), 'src/styles/globals.css'),
      'utf-8'
    );
  });

  test('globals.css contains all required color tokens', () => {
    expect(css).toMatch(/--color-navy:\s*#0d1b2e/);
    expect(css).toMatch(/--color-navy-mid:\s*#152338/);
    expect(css).toMatch(/--color-navy-light:\s*#1e3352/);
    expect(css).toMatch(/--color-gold:\s*#c9a84c/);
    expect(css).toMatch(/--color-gold-bright:\s*#e8c96a/);
    expect(css).toMatch(/--color-gold-dim:\s*#8a6f30/);
    expect(css).toMatch(/--color-gold-pale:\s*#f0dfa0/);
    expect(css).toMatch(/--color-text-light:\s*#e8dfc8/);
    expect(css).toMatch(/--color-text-mid:\s*#b8a888/);
    expect(css).toMatch(/--color-crimson:\s*#8b1a1a/);
  });

  test('globals.css contains font-family tokens for cinzel, cinzel-dec, garamond', () => {
    expect(css).toMatch(/--font-cinzel:\s*'Cinzel',\s*serif/);
    expect(css).toMatch(/--font-cinzel-dec:\s*'Cinzel Decorative',\s*serif/);
    expect(css).toMatch(/--font-garamond:\s*'EB Garamond',\s*serif/);
  });

  test('globals.css contains --spacing-nav: 70px', () => {
    expect(css).toMatch(/--spacing-nav:\s*70px/);
  });
});
