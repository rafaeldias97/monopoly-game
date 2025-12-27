import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async createUser(
    user: Partial<User>,
  ): Promise<{ user: User; token: string }> {
    const newUser = await this.usersRepository.save(user);
    const token = await this.authService.generateToken(
      newUser.id,
      newUser.nickname,
    );
    return { user: newUser, token };
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneUser(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
