import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { User } from 'src/decorators/user.decorator';
import { User as UserEntity } from 'src/entities/User.entity';
type ConversationType = Anthropic.Messages.MessageParam[];

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  getConversations(@User() user: UserEntity) {
    return this.conversationService.getConversations({ userId: user.id });
  }

  @Get(':id')
  getConversation(@Param('id') id: number, @User() user: UserEntity) {
    return this.conversationService.getConversation({ id, userId: user.id });
  }

  @Post()
  createConversation(
    @Body() body: { conversation: ConversationType },
    @User() user: UserEntity,
  ) {
    return this.conversationService.createConversation({
      conversation: body.conversation,
      userId: user.id,
    });
  }

  @Patch(':id/rename')
  renameConversation(
    @Param('id') id: number,
    @Body() body: { name: string },
    @User() user: UserEntity,
  ) {
    return this.conversationService.renameConversation({
      id,
      newName: body.name,
      userId: user.id,
    });
  }

  @Delete(':id')
  deleteConversation(@Param('id') id: number, @User() user: UserEntity) {
    return this.conversationService.deleteConversation({ id, userId: user.id });
  }
}
