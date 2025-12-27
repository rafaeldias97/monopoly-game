import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from './game';
import { Repository, DataSource } from 'typeorm';
import { GameUser } from '../game-users/game-user';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(GameUser)
    private gameUsersRepository: Repository<GameUser>,
    private dataSource: DataSource,
  ) {}

  async createGame(userId: string, game: Partial<Game>): Promise<Game> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the game
      const newGame = queryRunner.manager.create(Game, {
        ...game,
        status: game.status || GameStatus.PENDING,
      });
      const savedGame = await queryRunner.manager.save(newGame);

      // Add creator as game user automatically
      const gameUser = queryRunner.manager.create(GameUser, {
        gameId: savedGame.id,
        userId: userId,
        finishedAt: null,
      });
      await queryRunner.manager.save(gameUser);

      await queryRunner.commitTransaction();
      return savedGame;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllGames(): Promise<Game[]> {
    return this.gamesRepository.find();
  }

  async findOneGame(id: string): Promise<Game | null> {
    return this.gamesRepository.findOne({ where: { id } });
  }

  async updateGame(id: string, updateData: Partial<Game>): Promise<Game> {
    const game = await this.findOneGame(id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    Object.assign(game, updateData);
    return this.gamesRepository.save(game);
  }

  async removeGame(id: string): Promise<void> {
    const game = await this.findOneGame(id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    await this.gamesRepository.softDelete(id);
  }
}
