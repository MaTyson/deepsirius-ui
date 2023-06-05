import { exampleRouter } from '~/server/api/routers/example';
import { sillyRouter } from '~/server/api/routers/sillyrouter';
import { createTRPCRouter } from '~/server/api/trpc';

import { remoteJobRouter } from './routers/remote-job';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  remotejob: remoteJobRouter,
  silly: sillyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;