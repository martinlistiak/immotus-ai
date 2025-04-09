import { Injectable } from '@nestjs/common';
import { SceneRepository } from './scene.repository';
import { SceneType } from 'src/types/scene-ast';

@Injectable()
export class SceneService {
  constructor(private readonly sceneRepository: SceneRepository) {}

  getScenes(): { name: string; scene: SceneType }[] {
    return this.sceneRepository.findAll();
  }

  getScene({ name }: { name: string }) {
    return this.sceneRepository.findByName(name);
  }

  upsertScene({ name, scene }: { name: string; scene: SceneType }) {
    return this.sceneRepository.upsert({ name, scene });
  }

  renameScene({ name, newName }: { name: string; newName: string }) {
    return this.sceneRepository.rename(name, newName);
  }

  deleteScene({ name }: { name: string }) {
    return this.sceneRepository.delete(name);
  }
}
