import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { ExpressRequestInterface } from '@app/types/expressRequest.interface';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

  if (request.user) {
    return data ? request.user[data] : request.user;
  }

  return null;
});
