import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { Game } from '../games/game';
import { Transaction } from '../transactions/transaction';
import { GameUser } from '../game-users/game-user';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Transaction, GameUser])],
  providers: [CleanupService],
})
export class CleanupModule {}
