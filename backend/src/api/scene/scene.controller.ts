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
import { SceneType } from 'src/types/scene-ast';

@Controller('scene')
export class SceneController {
  constructor(private readonly sceneService: SceneService) {}

  @Get()
  getScenes(): { name: string; scene: SceneType }[] {
    return this.sceneService.getScenes();
  }

  @Get(':name')
  getScene(@Param('name') name: string) {
    return this.sceneService.getScene({ name });
  }

  @Post(':name')
  upsertScene(@Param('name') name: string, @Body() body: { scene: SceneType }) {
    return this.sceneService.upsertScene({ name, scene: body.scene });
  }

  @Patch(':name/rename')
  renameScene(@Param('name') name: string, @Body() body: { name: string }) {
    return this.sceneService.renameScene({ name, newName: body.name });
  }

  @Delete(':name')
  deleteScene(@Param('name') name: string) {
    console.log('deleteScene', name);
    return this.sceneService.deleteScene({ name });
  }
}
