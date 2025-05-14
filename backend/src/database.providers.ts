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
        poolSize: 20,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          keepAlive: true,
        },
      });

      try {
        console.log(
          `Attempting to connect to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`,
        );
        const connection = await dataSource.initialize();

        // Verify connection is working with a simple query
        await connection.query('SELECT 1');
        console.log('Database connection verified with test query');

        // Add ping function to periodically check connection
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(async () => {
          try {
            await connection.query('SELECT 1');
          } catch (error) {
            console.error(
              'Connection ping failed, attempting reconnect:',
              error,
            );
            try {
              await connection.destroy();
              await connection.initialize();
              console.log('Database reconnected successfully');
            } catch (reconnectError) {
              console.error('Reconnect failed:', reconnectError);
            }
          }
        }, 30000); // Ping every 30 seconds

        return connection;
      } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
      }
    },
  },
];
