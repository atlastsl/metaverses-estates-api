import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserErrors } from '../errors/errors';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { checkIsPublic } from '../../../main/apiutils/api.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = checkIsPublic(this.reflector, context);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException(
                UserErrors['USER_AUTH_TOKEN_NOT_FOUND'],
            );
        }
        try {
            request['user'] = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_AUTH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException(UserErrors['USER_INVALID_SESSION']);
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] =
            request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
