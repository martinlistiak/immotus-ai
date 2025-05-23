import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
// import { SceneRepository } from './scene.repository';
import { SceneObjects } from '../../types/scene-ast';
import { Scene } from '../../entities/Scene.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SceneService {
  constructor(
    // private readonly sceneRepository: SceneRepository,
    @Inject('SCENE_REPOSITORY')
    private sceneRepository: Repository<Scene>,
  ) {}

  getScenes({ userId }: { userId: number }): Promise<Scene[]> {
    return this.sceneRepository
      .createQueryBuilder('scene')
      .innerJoin('scene.users', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('scene.updatedAt', 'DESC')
      .getMany();
  }

  getSceneById({ id }: { id: number }) {
    return this.sceneRepository.findOne({ where: { id } });
  }

  async createScene({
    name,
    objects,
    userId,
  }: {
    name: string;
    objects: SceneObjects;
    userId: number;
  }): Promise<Scene> {
    const newScene = this.sceneRepository.create({
      name,
      objects,
      users: [{ id: userId }],
    });
    await this.sceneRepository.save(newScene);
    return newScene;
  }

  async updateSceneObjects({
    id,
    objects,
    userId,
  }: {
    id: number;
    objects: SceneObjects;
    userId: number;
  }) {
    await this.sceneRepository.update(id, {
      objects,
    });

    const updatedScene = await this.sceneRepository
      .createQueryBuilder('scene')
      .innerJoin('scene.users', 'user')
      .where('scene.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return updatedScene;
  }

  async renameScene({
    id,
    newName,
    userId,
  }: {
    id: number;
    newName: string;
    userId: number;
  }) {
    await this.sceneRepository.update(id, { name: newName });

    const updatedScene = await this.sceneRepository
      .createQueryBuilder('scene')
      .innerJoin('scene.users', 'user')
      .where('scene.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return updatedScene;
  }

  async deleteScene({ id, userId }: { id: number; userId: number }) {
    const userScene = await this.sceneRepository.findOne({
      where: { id, users: { id: userId } },
    });

    if (!userScene) {
      throw new ForbiddenException('Scene not found or you are not the owner');
    }

    return this.sceneRepository.delete({ id });
  }
}
