import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

export const cryptoHelper = {
  generateSalt() {
    return randomBytes(16).toString('hex');
  },
  async hash(password: string, salt: string) {
    const hash = (
      await pbkdf2Async(password, salt, 100, 64, 'sha512')
    ).toString('hex');
    return `${hash}.${salt}`;
  },
  async compare(password: string, hash: string) {
    const [passwordHash, salt] = hash.split('.');
    const inputPasswordHash = (
      await pbkdf2Async(password, salt, 100, 64, 'sha512')
    ).toString('hex');
    return inputPasswordHash === passwordHash;
  },
};
