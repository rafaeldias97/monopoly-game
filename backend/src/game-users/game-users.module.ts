import { Module } from '@nestjs/common';
import { GameUsersController } from './game-users.controller';
import { GameUsersService } from './game-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameUser } from './game-user';
import { Game } from '../games/game';
import { User } from '../users/users';

@Module({
  imports: [TypeOrmModule.forFeature([GameUser, Game, User])],
  controllers: [GameUsersController],
  providers: [GameUsersService],
})
export class GameUsersModule {}
