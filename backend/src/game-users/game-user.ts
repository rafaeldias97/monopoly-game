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
  Unique,
} from 'typeorm';
import { Game } from '../games/game';
import { User } from '../users/users';

@Entity()
@Unique(['gameId', 'userId'])
export class GameUser {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The id of the game user' })
  id: string;

  @ManyToOne(() => Game, { nullable: false })
  @JoinColumn({ name: 'gameId' })
  @ApiProperty({ description: 'The game' })
  game: Game;

  @Column()
  gameId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: 'The user' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'The date when the user finished the game',
    required: false,
  })
  finishedAt: Date | null;

  @CreateDateColumn()
  @ApiProperty({ description: 'The creation date of the game user' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The update date of the game user' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'The deletion date of the game user' })
  deletedAt: Date;
}
