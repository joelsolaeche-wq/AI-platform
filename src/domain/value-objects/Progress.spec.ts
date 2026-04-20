import { InvalidProgressError, Progress } from './Progress';

describe('Progress', () => {
  it('rejects values outside [0,1]', () => {
    expect(() => new Progress(-0.01)).toThrow(InvalidProgressError);
    expect(() => new Progress(1.01)).toThrow(InvalidProgressError);
    expect(() => new Progress(NaN)).toThrow(InvalidProgressError);
  });

  it('advances but never exceeds 1', () => {
    const p = new Progress(0.8).advance(0.5);
    expect(p.isComplete()).toBe(true);
    expect(p.value).toBe(1);
  });

  it('exposes percentage', () => {
    expect(new Progress(0.25).percentage).toBe(25);
  });
});
