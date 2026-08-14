import { FastifyInstance } from 'fastify';
import {
  ActiveScannerParamsSchema,
  PollingStatusResponseSchema,
  ScannersResponseSchema,
} from './schema';
import Manager from '../manager';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

function routes(app: FastifyInstance, manager: Manager) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/scanners',
    {
      schema: {
        response: {
          200: ScannersResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const scanners = manager.connections;
      return reply.send(scanners);
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/scanners/:id/activate',
    {
      schema: {
        params: ActiveScannerParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await manager.activateScanner(id);
        reply.status(200).send();
      } catch {
        reply.status(400).send();
      }
    },
  );

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/polling/start', async (request, reply) => {
      manager.startPolling();
      reply.status(200).send();
    });

  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/polling/stop', async (request, reply) => {
      await manager.stopPolling();
      reply.status(200).send();
    });

  app.withTypeProvider<ZodTypeProvider>().get(
    '/polling/status',
    {
      schema: {
        response: {
          200: PollingStatusResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = {
        running: manager.getIsPolling(),
        actualScannerId: manager.getCurrentScanner()?.scannerId,
      };
      reply.status(200).send(result);
    },
  );
}

export default routes;
