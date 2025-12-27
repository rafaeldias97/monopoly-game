import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

export enum GameStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The id of the game' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The name of the game' })
  name: string;

  @Column()
  @ApiProperty({ description: 'The password of the game' })
  password: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'The description of the game',
    required: false,
  })
  description: string | null;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PENDING,
  })
  @ApiProperty({
    description: 'The status of the game',
    enum: GameStatus,
    default: GameStatus.PENDING,
  })
  status: GameStatus;

  @CreateDateColumn()
  @ApiProperty({ description: 'The creation date of the game' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The update date of the game' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'The deletion date of the game' })
  deletedAt: Date;
}
