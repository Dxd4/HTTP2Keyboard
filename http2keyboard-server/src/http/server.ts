import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import routes from './routes';
import Manager from '../manager';
import { Config } from '../config';

class HTTPServer {
  private fastify: FastifyInstance;
  private config: Config;
  private manager: Manager;

  constructor(config: Config, manager: Manager) {
    this.config = config;
    this.manager = manager;

    this.fastify = Fastify({
      logger: false,
    }).withTypeProvider<ZodTypeProvider>();

    manager.startPolling();
  }

  public async start() {
    const shutdown = async () => {
      await this.close();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown());
    process.on('SIGTERM', () => void shutdown());

    this.fastify.setValidatorCompiler(validatorCompiler);
    this.fastify.setSerializerCompiler(serializerCompiler);

    this.fastify.register(routes, this.manager);

    await this.fastify.listen({
      host: this.config.host,
      port: this.config.port,
    });
    this.fastify.log.info(`HTTP2Keyboard started...`);
  }

  public async close() {
    await this.fastify.close();
  }
}

export default HTTPServer;
