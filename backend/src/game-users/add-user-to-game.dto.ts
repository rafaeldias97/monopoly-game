import { ApiProperty } from '@nestjs/swagger';

export class AddUserToGameDto {
  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({ description: 'The game password' })
  password: string;
}
