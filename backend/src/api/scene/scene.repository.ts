import * as fs from 'fs';
import * as path from 'path';
import { SceneType } from 'src/types/scene-ast';

const scenesFilePath = path.join(__dirname, '../../../scenes');

export class SceneRepository {
  findAll(): { name: string; scene: SceneType }[] {
    try {
      if (!fs.existsSync(scenesFilePath)) {
        fs.mkdirSync(scenesFilePath);
      }
      const scenes = fs.readdirSync(scenesFilePath);
      return scenes.map((scene) => ({
        name: scene,
        scene: JSON.parse(
          fs.readFileSync(path.join(scenesFilePath, scene), 'utf8'),
        ) as SceneType,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  findByName(name: string) {
    const scene = fs.readFileSync(path.join(scenesFilePath, name), 'utf8');
    return JSON.parse(scene) as SceneType;
  }

  upsert(data: { name: string; scene: SceneType }) {
    fs.writeFileSync(
      path.join(scenesFilePath, data.name),
      JSON.stringify(data.scene, null, 2),
    );
    return { name: data.name, scene: data.scene };
  }

  delete(name: string) {
    fs.unlinkSync(path.join(scenesFilePath, name));
    return { name };
  }

  rename(name: string, newName: string) {
    fs.renameSync(
      path.join(scenesFilePath, name),
      path.join(scenesFilePath, newName),
    );
    return { name: newName };
  }
}
