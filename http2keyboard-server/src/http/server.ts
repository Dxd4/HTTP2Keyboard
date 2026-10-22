import fastifyHttpProxy from '@fastify/http-proxy';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import path from 'node:path';
import { Config } from '../config';
import Manager from '../manager';
import routes from './routes';

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

    // Reverse proxy for Scanner2HTTP
    await this.fastify.register(fastifyHttpProxy, {
      upstream: `http://${this.config.s2hHost}:${this.config.s2hPort}`,
      prefix: '/scanner2http',
      rewritePrefix: '',
    });

    await this.fastify.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '/',
      wildcard: false,
    });

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
