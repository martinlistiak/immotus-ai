import { DataSource } from 'typeorm';
import { Conversation } from '../../entities/Conversation.entity';

export const conversationProviders = [
  {
    provide: 'CONVERSATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Conversation),
    inject: ['DATA_SOURCE'],
  },
];
