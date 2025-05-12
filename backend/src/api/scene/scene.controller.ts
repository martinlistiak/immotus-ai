import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SceneService } from './scene.service';
import { SceneObjects } from '../../types/scene-ast';
import { Scene } from '../../entities/Scene.entity';
@Controller('scene')
export class SceneController {
  constructor(private readonly sceneService: SceneService) {}

  @Get()
  getScenes(): Promise<Scene[]> {
    return this.sceneService.getScenes();
  }

  @Get(':id')
  getScene(@Param('id') id: number) {
    return this.sceneService.getSceneById({ id });
  }

  @Post()
  createScene(@Body() body: { name: string; objects: SceneObjects }) {
    return this.sceneService.createScene({
      name: body.name,
      objects: body.objects,
    });
  }

  @Patch(':id')
  updateScene(
    @Param('id') id: number,
    @Body() body: { objects: SceneObjects },
  ) {
    return this.sceneService.updateSceneObjects({
      id: Number(id),
      objects: body.objects,
    });
  }

  @Patch(':id/rename')
  renameScene(@Param('id') id: number, @Body() body: { name: string }) {
    return this.sceneService.renameScene({ id, newName: body.name });
  }

  @Delete(':id')
  deleteScene(@Param('id') id: number) {
    return this.sceneService.deleteScene({ id });
  }
}
