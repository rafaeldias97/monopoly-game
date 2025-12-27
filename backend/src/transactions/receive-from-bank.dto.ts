import { ApiProperty } from '@nestjs/swagger';

export class ReceiveFromBankDto {
  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({
    description: 'The amount to receive from bank (must be positive)',
    example: 200,
  })
  amount: number;

  @ApiProperty({
    description: 'The description of the transaction',
    required: false,
  })
  description?: string | null;
}
