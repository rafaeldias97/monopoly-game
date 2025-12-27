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
import { GamesService } from './games.service';
import { Game } from './game';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.decorator';

@Controller('games')
@ApiTags('Games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new game (creator is automatically added as member)',
  })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully with creator as member',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    type: Game,
    schema: {
      example: {
        name: 'Monopoly Game 1',
        password: 'password123',
        description: 'A fun monopoly game',
      },
    },
  })
  async createGame(
    @Body() game: Partial<Game>,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Game> {
    return this.gamesService.createGame(user.id, game);
  }

  @Get()
  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({ status: 200, description: 'Games fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllGames(): Promise<Game[]> {
    return this.gamesService.findAllGames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game by id' })
  @ApiResponse({ status: 200, description: 'Game fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOneGame(@Param('id') id: string): Promise<Game | null> {
    return this.gamesService.findOneGame(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a game' })
  @ApiResponse({ status: 200, description: 'Game updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    type: Game,
    schema: {
      example: {
        name: 'Updated Game Name',
        status: 'STARTED',
      },
    },
  })
  async updateGame(
    @Param('id') id: string,
    @Body() updateData: Partial<Game>,
  ): Promise<Game> {
    return this.gamesService.updateGame(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a game' })
  @ApiResponse({ status: 200, description: 'Game deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeGame(@Param('id') id: string): Promise<{ message: string }> {
    await this.gamesService.removeGame(id);
    return { message: 'Game deleted successfully' };
  }
}
