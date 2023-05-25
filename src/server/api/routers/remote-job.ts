import { z } from 'zod';
import { env } from '~/env.mjs';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import {
  cancelJob,
  checkJobState,
  sbatchDummyContent,
  submitJob,
} from '~/server/remote-job';

export const remoteJobRouter = createTRPCRouter({
  test: protectedProcedure.mutation(async ({ ctx }) => {
    const sshKeyPath = ctx.sshKeyPath ?? '';
    const username = ctx.session.user.name ?? '';
    const jobId = await submitJob(
      sshKeyPath,
      username,
      env.SSH_HOST,
      sbatchDummyContent,
    );
    return { jobId: jobId };
  }),
  create: protectedProcedure
    .input(
      z.object({
        jobName: z.string(),
        output: z.string(),
        error: z.string(),
        ntasks: z.number(),
        partition: z.string(),
        command: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sbatchContent = `#!/bin/bash
        #SBATCH --job-name=${input.jobName}
        #SBATCH --output=${input.output}
        #SBATCH --error=${input.error}
        #SBATCH --ntasks=${input.ntasks}
        #SBATCH --partition=${input.partition}
        
        
        ${input.command}`;
      const sshKeyPath = ctx.sshKeyPath ?? '';
      const username = ctx.session.user.name ?? '';

      const jobId = await submitJob(
        sshKeyPath,
        username,
        env.SSH_HOST,
        sbatchContent,
      );
      return { jobId: jobId };
    }),
  status: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sshKeyPath = ctx.sshKeyPath ?? '';
      const username = ctx.session.user.name ?? '';

      const jobStatus = await checkJobState(
        sshKeyPath,
        username,
        env.SSH_HOST,
        input.jobId,
      );
      return { jobStatus: jobStatus };
    }),
  cancel: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sshKeyPath = ctx.sshKeyPath ?? '';
      const username = ctx.session.user.name ?? '';

      const cancelStatus = await cancelJob(
        sshKeyPath,
        username,
        env.SSH_HOST,
        input.jobId,
      );
      return { cancelStatus: cancelStatus };
    }),
});
