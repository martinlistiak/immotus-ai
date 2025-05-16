import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SceneObjects } from '../types/scene-ast';
import { User } from './User.entity';

@Entity()
export class Scene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb' })
  objects: SceneObjects;

  @ManyToMany(() => User, (user) => user.scenes)
  @JoinTable({
    name: 'user_scenes',
    joinColumn: { name: 'sceneId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
