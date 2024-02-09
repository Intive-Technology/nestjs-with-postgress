import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(createUserDto as User);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({
      id,
    });
  }

  async findByEmailForAuth(email: string) {
    return await this.userRepository.findOne({
      select: ['id', 'email', 'password', 'isActive'],
      where: { email, isActive: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOneBy({
      id,
    });
    if (user) {
      const result = await this.userRepository.merge(user, updateUserDto);
      return result;
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
