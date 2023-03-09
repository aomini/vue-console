import { createNewProject } from '../services/project';
import { createConnection } from 'typeorm';

// development
// const companyId = 25795;

// production
const companyId = 130788;

createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'vendors',
  logger: 'simple-console',
  entities: ['../models/*{.ts,.js}']
}).then(async connection => {
  const times = 100;
  for (let i = 0; i < times; i ++) {
    try {
      await createNewProject('onboarding', companyId);
      console.log('project created', i);
    } catch (e) {
      console.error('Failed to create a project');
    }
  }
}).catch(() => {
  console.log('error');
});
