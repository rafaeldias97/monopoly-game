import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({
    description: 'The description of the transaction',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'The amount of the transaction (can be positive or negative)',
  })
  amount: number;
}
