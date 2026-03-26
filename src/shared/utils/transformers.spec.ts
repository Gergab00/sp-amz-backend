import { toStringArray } from './transformers';

describe('toStringArray', () => {
  it('parses CSV string', () => {
    expect(toStringArray('A,B')).toEqual(['A', 'B']);
  });

  it('parses single string', () => {
    expect(toStringArray('A')).toEqual(['A']);
  });

  it('accepts array input', () => {
    expect(toStringArray(['A', 'B'])).toEqual(['A', 'B']);
  });

  it('returns undefined for empty or undefined', () => {
    expect(toStringArray('')).toBeUndefined();
    expect(toStringArray(undefined)).toBeUndefined();
  });
});
// NOTE: Se aplicó formato con style=prettier (origen: configuración del proyecto)
