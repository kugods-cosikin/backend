import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();
// To do : 개발용, 배포용 분리
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [join(__dirname, '../entities/*{.ts,.js}')],
});

export default AppDataSource;
