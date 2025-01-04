import { greet } from '../src';

describe('greet', () => {
  it('should return greeting with name', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
