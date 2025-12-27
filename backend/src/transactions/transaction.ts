import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from '../games/game';
import { User } from '../users/users';

export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The id of the transaction' })
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: 'The user' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Game, { nullable: false })
  @JoinColumn({ name: 'gameId' })
  @ApiProperty({ description: 'The game' })
  game: Game;

  @Column()
  gameId: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'The description of the transaction',
    required: false,
  })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({
    description: 'The amount of the transaction (can be positive or negative)',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @ApiProperty({
    description: 'The status of the transaction',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  @ApiProperty({ description: 'The creation date of the transaction' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The update date of the transaction' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'The deletion date of the transaction' })
  deletedAt: Date;
}
