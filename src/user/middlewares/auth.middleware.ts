import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;

      return next();
    }

    const [, token] = req.headers.authorization.split(' ');

    try {
      const decode = verify(token, process.env.JWT_SECRET);
      req.user = await this.userService.findById(decode.id);
    } catch (error) {
      req.user = null;
    }

    next();
  }
}
