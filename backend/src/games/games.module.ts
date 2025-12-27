import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game';
import { GameUser } from '../game-users/game-user';

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameUser])],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
