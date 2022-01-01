import { ConnectionOptions } from 'typeorm';
import { TagEntity } from '@app/tag/tag.entity';
import { UserEntity } from '@app/user/user.entity';

const config: ConnectionOptions = {
  type: 'postgres',
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
  entities: [TagEntity, UserEntity],
  synchronize: process.env.NODE_ENV === 'dev',
};

export default config;
