import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { conversationProviders } from './conversation.providers';
import { DatabaseModule } from '../../database.module';
import { SceneModule } from '../scene/scene.module';
@Module({
  imports: [DatabaseModule, SceneModule],
  controllers: [ConversationController],
  providers: [...conversationProviders, ConversationService],
  exports: [...conversationProviders, ConversationService],
})
export class ConversationModule {}
