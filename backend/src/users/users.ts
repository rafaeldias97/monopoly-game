import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The id of the user' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The nickname of the user' })
  nickname: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'The creation date of the user' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The update date of the user' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'The deletion date of the user' })
  deletedAt: Date;
}
