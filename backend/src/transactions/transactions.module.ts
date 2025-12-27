import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction';
import { Game } from '../games/game';
import { User } from '../users/users';
import { GameUser } from '../game-users/game-user';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Game, User, GameUser])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
