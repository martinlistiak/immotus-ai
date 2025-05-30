/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { User as UserEntity } from '../../entities/User.entity';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>,
  ) {}

  @Post('logout')
  logout(@Res() res: Response) {
    // @ts-ignore
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });

    // @ts-ignore
    res.status(200).json({ message: 'Successfully logged out' });
    return { message: 'Successfully logged out' };
  }

  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
    @Res() res: Response,
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: body.email },
      });
      if (!user) {
        return { error: 'User not found' };
      }
      const valid = await bcrypt.compare(body.password, user.password);

      if (!valid) {
        // @ts-ignore
        res.status(200).json({ error: 'Invalid password' });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      //
      // add jwt to cookie
      const token = jwt.sign(rest, process.env.AUTH_SECRET!);
      // @ts-ignore
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
      // @ts-ignore
      res.status(200).json({ user: rest });

      return { user: rest };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('')
  getAuthenticatedUser(@User() user: UserEntity) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
