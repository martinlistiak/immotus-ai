import { Inject, Injectable } from '@nestjs/common';
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

  getScenes(): Promise<Scene[]> {
    return this.sceneRepository.find({ order: { updatedAt: 'DESC' } });
  }

  getSceneById({ id }: { id: number }) {
    return this.sceneRepository.findOne({ where: { id } });
  }

  async createScene({
    name,
    objects,
  }: {
    name: string;
    objects: SceneObjects;
  }): Promise<Scene> {
    const newScene = this.sceneRepository.create({ name, objects });
    await this.sceneRepository.save(newScene);
    return newScene;
  }

  async updateSceneObjects({
    id,
    objects,
  }: {
    id: number;
    objects: SceneObjects;
  }) {
    await this.sceneRepository.update(id, {
      objects,
    });

    const updatedScene = await this.sceneRepository.findOne({
      where: { id },
    });

    return updatedScene;
  }

  async renameScene({ id, newName }: { id: number; newName: string }) {
    await this.sceneRepository.update(id, { name: newName });
    const updatedScene = await this.sceneRepository.findOne({
      where: { id },
    });
    return updatedScene;
  }

  deleteScene({ id }: { id: number }) {
    return this.sceneRepository.delete({ id });
  }
}
