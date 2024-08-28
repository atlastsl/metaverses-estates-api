import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';
import { HttpAdapterHost } from '@nestjs/core';
import { AppErrorsHandler } from './main/errors/errorshandler';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import requestIp from 'request-ip';

export class AppLauncher {
    baseUrl: string;
    constructor(
        private readonly app: INestApplication,
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {
        this.baseUrl = this.configService.get('APP_ROUTE_PREFIX');
    }

    public setup(): void {
        this.setupCors();
        this.setupErrorHandler();
        this.setupGlobalPrefix();
        this.setupGlobalPipes();
        this.setupIpAddressMiddleware();
        this.setupSwagger();
    }

    private setupCors(): void {
        this.app.use(cors());
    }

    private setupErrorHandler(): void {
        const httpAdapterHost = this.app.get<HttpAdapterHost>(HttpAdapterHost);
        this.app.useGlobalFilters(new AppErrorsHandler(httpAdapterHost));
    }

    private setupGlobalPrefix(): void {
        this.app.setGlobalPrefix(this.baseUrl);
    }

    private setupGlobalPipes(): void {
        this.app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );
    }

    private setupIpAddressMiddleware(): void {
        this.app.use(requestIp.mw({ attributeName: 'ipAddress' }));
    }

    private setupSwagger(): void {
        const localUrl = this.configService.get<string>('API_URL_LOCAL')!;
        const devUrl = this.configService.get('API_URL_DEV');
        const prodUrl = this.configService.get('API_URL_PROD');
        const config = new DocumentBuilder()
            .setTitle('Metaverses Estates API')
            .setDescription(
                'This documentation provides all endpoint and entities of Metaverses Estates API',
            )
            .setVersion('1.0')
            .addServer(localUrl, 'For local environment')
            .addServer(devUrl, 'For dev environment')
            .addServer(prodUrl, 'For production environment')
            .addTag('Auth', 'Login & Authentications endpoints')
            .addTag('Users', 'User Accounts management endpoints')
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Authentication Token',
                name: 'Authorization',
                in: 'header',
            })
            .build();

        const document = SwaggerModule.createDocument(this.app, config);
        SwaggerModule.setup(
            this.baseUrl + '/documentation',
            this.app,
            document,
        );
    }

    public async launchApp(): Promise<void> {
        const port = this.configService.get('PORT');
        const appName = this.configService.get('APP_NAME');

        await this.app.listen(port, () => {
            this.logger.log(`Server ${appName} started on port ${port}`);
        });
    }
}
