import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Conversation } from './Conversation.entity';
import { Scene } from './Scene.entity';

export enum UserRole {
  THREE_D_DESIGNER = '3d designer',
  ARCHITECT = 'architect',
  INTERIOR_DESIGNER = 'interior designer',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role: UserRole;

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];

  @ManyToMany(() => Scene)
  @JoinTable({
    name: 'user_scenes',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sceneId', referencedColumnName: 'id' },
  })
  scenes: Scene[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
