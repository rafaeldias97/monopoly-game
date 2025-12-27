import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameUser } from './game-user';
import { Repository } from 'typeorm';
import { Game } from '../games/game';
import { User } from '../users/users';
import { AddUserToGameDto } from './add-user-to-game.dto';

@Injectable()
export class GameUsersService {
  constructor(
    @InjectRepository(GameUser)
    private gameUsersRepository: Repository<GameUser>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async addUserToGame(
    userId: string,
    dto: AddUserToGameDto,
  ): Promise<GameUser> {
    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Verify password
    if (game.password !== dto.password) {
      throw new BadRequestException('Invalid game password');
    }

    // Verify user exists
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already in the game
    const existingGameUser = await this.gameUsersRepository.findOne({
      where: { gameId: dto.gameId, userId: userId },
      withDeleted: false,
    });

    if (existingGameUser) {
      throw new ConflictException('User is already in this game');
    }

    // Create game user relationship
    const gameUser = this.gameUsersRepository.create({
      gameId: dto.gameId,
      userId: userId,
      finishedAt: null,
    });

    return this.gameUsersRepository.save(gameUser);
  }

  async findAllGameUsers(): Promise<GameUser[]> {
    return this.gameUsersRepository.find({
      relations: ['game', 'user'],
    });
  }

  async findGameUsersByGameId(gameId: string): Promise<GameUser[]> {
    return this.gameUsersRepository.find({
      where: { gameId },
      relations: ['game', 'user'],
    });
  }

  async findGameUsersByUserId(userId: string): Promise<GameUser[]> {
    return this.gameUsersRepository.find({
      where: { userId },
      relations: ['game', 'user'],
    });
  }

  async findOneGameUser(id: string): Promise<GameUser | null> {
    return this.gameUsersRepository.findOne({
      where: { id },
      relations: ['game', 'user'],
    });
  }

  async updateGameUser(
    id: string,
    updateData: Partial<GameUser>,
  ): Promise<GameUser> {
    const gameUser = await this.findOneGameUser(id);
    if (!gameUser) {
      throw new NotFoundException(`GameUser with ID ${id} not found`);
    }

    Object.assign(gameUser, updateData);
    return this.gameUsersRepository.save(gameUser);
  }

  async removeUserFromGame(id: string): Promise<void> {
    const gameUser = await this.findOneGameUser(id);
    if (!gameUser) {
      throw new NotFoundException(`GameUser with ID ${id} not found`);
    }

    await this.gameUsersRepository.softDelete(id);
  }

  async declareBankruptcy(userId: string, gameId: string): Promise<GameUser> {
    const gameUser = await this.gameUsersRepository.findOne({
      where: { userId, gameId },
    });

    if (!gameUser) {
      throw new NotFoundException(
        `GameUser with userId ${userId} and gameId ${gameId} not found`,
      );
    }

    if (gameUser.finishedAt) {
      throw new BadRequestException('User has already declared bankruptcy');
    }

    gameUser.finishedAt = new Date();
    return this.gameUsersRepository.save(gameUser);
  }
}
