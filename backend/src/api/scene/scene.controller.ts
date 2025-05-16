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
import { User } from '../../decorators/user.decorator';
import { User as UserEntity } from '../../entities/User.entity';
@Controller('scene')
export class SceneController {
  constructor(private readonly sceneService: SceneService) {}

  @Get()
  getScenes(@User() user: UserEntity): Promise<Scene[]> {
    return this.sceneService.getScenes({ userId: user.id });
  }

  @Get(':id')
  getScene(@Param('id') id: number) {
    return this.sceneService.getSceneById({ id });
  }

  @Post()
  createScene(
    @Body() body: { name: string; objects: SceneObjects },
    @User() user: UserEntity,
  ) {
    return this.sceneService.createScene({
      name: body.name,
      objects: body.objects,
      userId: user.id,
    });
  }

  @Patch(':id')
  updateScene(
    @Param('id') id: number,
    @Body() body: { objects: SceneObjects },
    @User() user: UserEntity,
  ) {
    return this.sceneService.updateSceneObjects({
      id: Number(id),
      objects: body.objects,
      userId: user.id,
    });
  }

  @Patch(':id/rename')
  renameScene(
    @Param('id') id: number,
    @Body() body: { name: string },
    @User() user: UserEntity,
  ) {
    return this.sceneService.renameScene({
      id,
      newName: body.name,
      userId: user.id,
    });
  }

  @Delete(':id')
  deleteScene(@Param('id') id: number, @User() user: UserEntity) {
    return this.sceneService.deleteScene({ id, userId: user.id });
  }
}
