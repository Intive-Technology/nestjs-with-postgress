import { pbkdf2Sync } from 'crypto';
import { cryptoHelper } from './crypto';

describe('cryptoHelper', () => {
  it('should generate salt string', async () => {
    const salt = cryptoHelper.generateSalt();
    expect(salt).toHaveLength(32);
  });

  it('Should create password hash', async () => {
    const password = 'mysecretpassword';
    const salt = cryptoHelper.generateSalt();
    const hashedPassword = pbkdf2Sync(
      password,
      salt,
      100,
      64,
      'sha512',
    ).toString('hex');
    const hash = await cryptoHelper.hash(password, salt);
    expect(hash).toHaveLength(161);
    expect(hash).toEqual(`${hashedPassword}.${salt}`);
  });

  it('Should compare same password', async () => {
    const password = 'mysecretpassword';
    const salt = cryptoHelper.generateSalt();
    const hashedPassword = pbkdf2Sync(
      password,
      salt,
      100,
      64,
      'sha512',
    ).toString('hex');
    const result = await cryptoHelper.compare(
      password,
      `${hashedPassword}.${salt}`,
    );
    expect(result).toBeTruthy();
  });

  it('Should fail to compare different password', async () => {
    const password = 'mysecretpassword';
    const salt = cryptoHelper.generateSalt();
    const hashedPassword = pbkdf2Sync(
      password,
      salt,
      100,
      64,
      'sha512',
    ).toString('hex');
    const result = await cryptoHelper.compare(
      'notMyPassword',
      `${hashedPassword}.${salt}`,
    );
    expect(result).toBeFalsy();
  });
});
