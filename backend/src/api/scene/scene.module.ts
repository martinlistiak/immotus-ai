import { Module } from '@nestjs/common';
import { SceneController } from './scene.controller';
import { SceneService } from './scene.service';
import { sceneProviders } from './scene.providers';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SceneController],
  providers: [SceneService, ...sceneProviders],
  exports: [SceneService],
})
export class SceneModule {}
