import { DataSource } from 'typeorm';
import { Scene } from '../../entities/Scene.entity';

export const sceneProviders = [
  {
    provide: 'SCENE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Scene),
    inject: ['DATA_SOURCE'],
  },
];
