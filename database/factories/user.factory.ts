import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../src/user/entities/user.entity';
import { cryptoHelper } from '../../src/utils/crypto';

export default setSeederFactory(User, async (faker) => {
  const salt = cryptoHelper.generateSalt();
  const password = 'abc@123';
  const user = new User();
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email();
  user.password = await cryptoHelper.hash(password, salt);
  return user;
});
