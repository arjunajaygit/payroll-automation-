import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => console.error('Redis Client Error (Web Service):', err.message));
connection.on('connect', () => console.log('Redis Client Connected Successfully (Web Service)!'));

export const payrollQueue = new Queue('payroll', { connection: connection as any });
