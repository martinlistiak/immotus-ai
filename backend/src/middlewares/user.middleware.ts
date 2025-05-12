/* eslint-disable @typescript-eslint/no-namespace */
import { User } from '../entities/User.entity';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token: string = req.cookies['jwt'];

    if (!token) {
      return next();
    }

    const tokenContent = jwt.verify(token, process.env.AUTH_SECRET!) as Omit<
      User,
      'password'
    >;

    if (!tokenContent) {
      return next();
    }

    const user = await this.userRepository.findOne({
      where: { id: tokenContent.id },
    });

    if (!user) {
      return next();
    }

    req.user = user;

    return next();
  }
}
