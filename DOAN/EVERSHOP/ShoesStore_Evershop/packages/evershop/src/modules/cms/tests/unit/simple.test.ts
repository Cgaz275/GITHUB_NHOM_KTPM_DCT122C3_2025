import { describe, it, expect } from '@jest/globals';

describe('CMS Simple Test', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });
});
