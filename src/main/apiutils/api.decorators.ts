import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const checkIsPublic = (
    reflector: Reflector,
    context: ExecutionContext,
) => reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler()) === true;
