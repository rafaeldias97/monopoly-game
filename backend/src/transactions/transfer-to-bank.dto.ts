import { ApiProperty } from '@nestjs/swagger';

export class TransferToBankDto {
  @ApiProperty({ description: 'The game id' })
  gameId: string;

  @ApiProperty({
    description: 'The amount to transfer to bank (must be positive)',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'The description of the transfer',
    required: false,
  })
  description?: string | null;
}
