/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from './transaction';
import { Repository, DataSource } from 'typeorm';
import { Game } from '../games/game';
import { User } from '../users/users';
import { GameUser } from '../game-users/game-user';
import { CreateTransactionDto } from './create-transaction.dto';
import { StartGameDto } from './start-game.dto';
import { TransferMoneyDto } from './transfer-money.dto';
import { ReceiveFromBankDto } from './receive-from-bank.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(GameUser)
    private gameUsersRepository: Repository<GameUser>,
    private dataSource: DataSource,
  ) {}

  async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Verify user exists
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify user is in the game
    const gameUser = await this.gameUsersRepository.findOne({
      where: { gameId: dto.gameId, userId: userId },
    });
    if (!gameUser) {
      throw new BadRequestException('User is not in this game');
    }

    // Create transaction
    const transaction = this.transactionsRepository.create({
      userId: userId,
      gameId: dto.gameId,
      description: dto.description || null,
      amount: dto.amount,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // Process transaction with eventual consistency
    await this.processTransaction(savedTransaction.id);

    return savedTransaction;
  }

  async startGame(dto: StartGameDto): Promise<Transaction[]> {
    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    if (dto.initialBalance <= 0) {
      throw new BadRequestException('Initial balance must be greater than 0');
    }

    // Get all users in the game
    const gameUsers = await this.gameUsersRepository.find({
      where: { gameId: dto.gameId },
    });

    if (gameUsers.length === 0) {
      throw new BadRequestException('No users in this game');
    }

    // Create initial transactions for all users
    const transactions: Transaction[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const gameUser of gameUsers) {
        const transaction = queryRunner.manager.create(Transaction, {
          userId: gameUser.userId,
          gameId: dto.gameId,
          description: 'Initial balance',
          amount: dto.initialBalance,
          status: TransactionStatus.PAID,
        });

        const savedTransaction = await queryRunner.manager.save(transaction);
        transactions.push(savedTransaction);
      }

      await queryRunner.commitTransaction();
      return transactions;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateUserBalance(userId: string, gameId: string): Promise<number> {
    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'balance')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.gameId = :gameId', { gameId })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.PAID,
      })
      .getRawOne<{ balance: string }>();

    return result ? parseFloat(result.balance) || 0 : 0;
  }

  async processTransaction(transactionId: string): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return;
    }

    // Update transaction status to PAID
    transaction.status = TransactionStatus.PAID;
    await this.transactionsRepository.save(transaction);

    // Calculate new balance with eventual consistency
    await this.checkAndUpdateUserFinishedStatus(
      transaction.userId,
      transaction.gameId,
    );
  }

  async checkAndUpdateUserFinishedStatus(
    userId: string,
    gameId: string,
  ): Promise<void> {
    const balance = await this.calculateUserBalance(userId, gameId);

    const gameUser = await this.gameUsersRepository.findOne({
      where: { userId, gameId },
    });

    if (!gameUser) {
      return;
    }

    // If balance is 0 or negative, mark user as finished
    if (balance <= 0 && !gameUser.finishedAt) {
      gameUser.finishedAt = new Date();
      await this.gameUsersRepository.save(gameUser);
    }
  }

  async findAllTransactions(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByGameId(gameId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { gameId },
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransactionsByGameAndUser(
    gameId: string,
    userId: string,
  ): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { gameId, userId },
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneTransaction(id: string): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['user', 'game'],
    });
  }

  async getUserBalance(
    userId: string,
    gameId: string,
  ): Promise<{ balance: number; transactions: Transaction[] }> {
    const balance = await this.calculateUserBalance(userId, gameId);
    const transactions = await this.findTransactionsByGameAndUser(
      gameId,
      userId,
    );

    return { balance, transactions };
  }

  async cancelTransaction(id: string): Promise<Transaction> {
    const transaction = await this.findOneTransaction(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException('Transaction is already cancelled');
    }

    transaction.status = TransactionStatus.CANCELLED;
    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // Recalculate balance after cancellation
    await this.checkAndUpdateUserFinishedStatus(
      transaction.userId,
      transaction.gameId,
    );

    return savedTransaction;
  }

  async getAllPlayersBalance(gameId: string): Promise<
    Array<{
      userId: string;
      user: User;
      balance: number;
      finishedAt: Date | null;
    }>
  > {
    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Get all users in the game
    const gameUsers = await this.gameUsersRepository.find({
      where: { gameId },
      relations: ['user'],
    });

    // Calculate balance for each user
    const playersBalance = await Promise.all(
      gameUsers.map(async (gameUser) => {
        const balance = await this.calculateUserBalance(
          gameUser.userId,
          gameId,
        );

        return {
          userId: gameUser.userId,
          user: gameUser.user,
          balance,
          finishedAt: gameUser.finishedAt,
        };
      }),
    );

    return playersBalance;
  }

  async transferMoney(
    fromUserId: string,
    dto: TransferMoneyDto,
  ): Promise<{
    fromTransaction: Transaction;
    toTransaction: Transaction;
  }> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot transfer money to yourself');
    }

    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Verify both users exist
    const fromUser = await this.usersRepository.findOne({
      where: { id: fromUserId },
    });
    if (!fromUser) {
      throw new NotFoundException(`User with ID ${fromUserId} not found`);
    }

    const toUser = await this.usersRepository.findOne({
      where: { id: dto.toUserId },
    });
    if (!toUser) {
      throw new NotFoundException(`User with ID ${dto.toUserId} not found`);
    }

    // Verify both users are in the game
    const fromGameUser = await this.gameUsersRepository.findOne({
      where: { gameId: dto.gameId, userId: fromUserId },
    });
    if (!fromGameUser) {
      throw new BadRequestException('Sender user is not in this game');
    }

    // Verify sender has not declared bankruptcy
    if (fromGameUser.finishedAt) {
      throw new BadRequestException('User has declared bankruptcy and cannot perform transactions');
    }

    const toGameUser = await this.gameUsersRepository.findOne({
      where: { gameId: dto.gameId, userId: dto.toUserId },
    });
    if (!toGameUser) {
      throw new BadRequestException('Receiver user is not in this game');
    }

    // Check if sender has enough balance
    const fromBalance = await this.calculateUserBalance(fromUserId, dto.gameId);
    if (fromBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create negative transaction for sender
      const fromTransaction = queryRunner.manager.create(Transaction, {
        userId: fromUserId,
        gameId: dto.gameId,
        description: dto.description || `Transfer to ${toUser.nickname}`,
        amount: -dto.amount,
        status: TransactionStatus.PAID,
      });

      // Create positive transaction for receiver
      const toTransaction = queryRunner.manager.create(Transaction, {
        userId: dto.toUserId,
        gameId: dto.gameId,
        description: dto.description || `Transfer from ${fromUser.nickname}`,
        amount: dto.amount,
        status: TransactionStatus.PAID,
      });

      const savedFromTransaction =
        await queryRunner.manager.save(fromTransaction);
      const savedToTransaction = await queryRunner.manager.save(toTransaction);

      await queryRunner.commitTransaction();

      // Check and update finished status for both users
      await this.checkAndUpdateUserFinishedStatus(fromUserId, dto.gameId);
      await this.checkAndUpdateUserFinishedStatus(dto.toUserId, dto.gameId);

      return {
        fromTransaction: savedFromTransaction,
        toTransaction: savedToTransaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async receiveFromBank(
    userId: string,
    dto: ReceiveFromBankDto,
  ): Promise<Transaction> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Verify game exists
    const game = await this.gamesRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
    }

    // Verify user exists
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify user is in the game
    const gameUser = await this.gameUsersRepository.findOne({
      where: { gameId: dto.gameId, userId: userId },
    });
    if (!gameUser) {
      throw new BadRequestException('User is not in this game');
    }

    // Verify user has not declared bankruptcy
    if (gameUser.finishedAt) {
      throw new BadRequestException('User has declared bankruptcy and cannot receive loans');
    }

    // Create positive transaction from bank
    const transaction = this.transactionsRepository.create({
      userId: userId,
      gameId: dto.gameId,
      description: dto.description || 'Money from bank',
      amount: dto.amount,
      status: TransactionStatus.PAID,
    });

    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    // Check and update finished status
    await this.checkAndUpdateUserFinishedStatus(userId, dto.gameId);

    return savedTransaction;
  }
}
