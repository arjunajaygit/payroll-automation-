import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// BullMQ requires maxRetriesPerRequest to be null
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const payrollQueue = new Queue('payroll', { connection: connection as any });
