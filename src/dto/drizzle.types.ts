import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../db';

export type NodePgTransaction = Parameters<
  NodePgDatabase<typeof schema>['transaction']
>[0];
