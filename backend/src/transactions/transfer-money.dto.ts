import { ApiProperty } from '@nestjs/swagger';

export class TransferMoneyDto {
  @ApiProperty({ description: 'The user id who is receiving the money' })
  toUserId: string;

  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({
    description: 'The amount to transfer (must be positive)',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'The description of the transfer',
    required: false,
  })
  description?: string | null;
}
