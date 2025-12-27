import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GameUsersService } from './game-users.service';
import { GameUser } from './game-user';
import { AddUserToGameDto } from './add-user-to-game.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.decorator';

@Controller('game-users')
@ApiTags('Game Users')
export class GameUsersController {
  constructor(private readonly gameUsersService: GameUsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a user to a game (requires password)' })
  @ApiResponse({
    status: 201,
    description: 'User added to game successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request or invalid password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game or User not found' })
  @ApiResponse({ status: 409, description: 'User already in game' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: AddUserToGameDto })
  async addUserToGame(
    @Body() dto: AddUserToGameDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<GameUser> {
    return this.gameUsersService.addUserToGame(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all game users' })
  @ApiResponse({
    status: 200,
    description: 'Game users fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllGameUsers(): Promise<GameUser[]> {
    return this.gameUsersService.findAllGameUsers();
  }

  @Get('game/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users in a specific game' })
  @ApiResponse({
    status: 200,
    description: 'Game users fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findGameUsersByGameId(
    @Param('gameId') gameId: string,
  ): Promise<GameUser[]> {
    return this.gameUsersService.findGameUsersByGameId(gameId);
  }

  @Get('my-games')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all games for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Game users fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findMyGames(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<GameUser[]> {
    return this.gameUsersService.findGameUsersByUserId(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a game user by id' })
  @ApiResponse({
    status: 200,
    description: 'Game user fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOneGameUser(@Param('id') id: string): Promise<GameUser | null> {
    return this.gameUsersService.findOneGameUser(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a game user' })
  @ApiResponse({
    status: 200,
    description: 'Game user updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    type: GameUser,
    schema: {
      example: {
        finishedAt: '2024-12-27T12:00:00Z',
      },
    },
  })
  async updateGameUser(
    @Param('id') id: string,
    @Body() updateData: Partial<GameUser>,
  ): Promise<GameUser> {
    return this.gameUsersService.updateGameUser(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a user from a game' })
  @ApiResponse({
    status: 200,
    description: 'User removed from game successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeUserFromGame(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.gameUsersService.removeUserFromGame(id);
    return { message: 'User removed from game successfully' };
  }

  @Post('declare-bankruptcy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Declare bankruptcy for the current user in a game',
  })
  @ApiResponse({
    status: 200,
    description: 'Bankruptcy declared successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User has already declared bankruptcy',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gameId: { type: 'string' },
      },
      required: ['gameId'],
    },
  })
  async declareBankruptcy(
    @Body() body: { gameId: string },
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<GameUser> {
    return this.gameUsersService.declareBankruptcy(user.id, body.gameId);
  }
}
