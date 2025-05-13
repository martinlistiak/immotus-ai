import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/User.entity';
import { Conversation } from './entities/Conversation.entity';
import { Scene } from './entities/Scene.entity';

dotenv.config();

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4002,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [User, Conversation, Scene],
        synchronize: true,
        connectTimeoutMS: 30000,
        logging: true,
        logger: 'advanced-console',
      });

      try {
        console.log(
          `Attempting to connect to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`,
        );
        const connection = await dataSource.initialize();
        console.log('Database connection established successfully');
        return connection;
      } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
      }
    },
  },
];
