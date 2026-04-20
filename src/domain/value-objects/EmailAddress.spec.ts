import { EmailAddress, InvalidEmailError } from './EmailAddress';

describe('EmailAddress', () => {
  it('normalizes to lowercase and trims whitespace', () => {
    const e = new EmailAddress('  User@Example.COM ');
    expect(e.value).toBe('user@example.com');
  });

  it('rejects malformed addresses', () => {
    expect(() => new EmailAddress('not-an-email')).toThrow(InvalidEmailError);
    expect(() => new EmailAddress('missing@tld')).toThrow(InvalidEmailError);
    expect(() => new EmailAddress('')).toThrow(InvalidEmailError);
  });

  it('compares by value', () => {
    expect(new EmailAddress('a@b.com').equals(new EmailAddress('A@B.COM'))).toBe(true);
    expect(new EmailAddress('a@b.com').equals(new EmailAddress('c@d.com'))).toBe(false);
  });
});
