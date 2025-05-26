import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    if (!user.password) throw new Error('Password is required');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password, salt);
    return this.userRepository.save({ ...user, password: hashedPassword });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}