import { ApiProperty } from '@nestjs/swagger';

export class StartGameDto {
  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({
    description: 'The initial balance for each user in the game',
    example: 1500,
  })
  initialBalance: number;
}
