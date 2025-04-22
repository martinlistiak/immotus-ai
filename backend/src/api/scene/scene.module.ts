import { Module } from '@nestjs/common';
import { SceneController } from './scene.controller';
import { SceneService } from './scene.service';
import { SceneRepository } from './scene.repository';
@Module({
  imports: [],
  controllers: [SceneController],
  providers: [SceneService, SceneRepository],
  exports: [SceneService],
})
export class SceneModule {}
