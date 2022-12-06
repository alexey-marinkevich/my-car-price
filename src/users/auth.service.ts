import * as bcrypt from 'bcrypt';

import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(body: CreateUserDto) {
    const { email, password } = body;

    // check user's existence
    const [user] = await this.usersService.findByEmail(email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    // crypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // save to a db
    const newUser = await this.usersService.create(email, passwordHash);

    return newUser;
  }

  async signin(body: CreateUserDto) {
    const { email, password } = body;

    // check email's existence
    const [user] = await this.usersService.findByEmail(email);
    console.log(user);

    if (!user) {
      throw new BadRequestException('Email or password is incorrect');
    }

    // compare passwords
    const comparePassword = await bcrypt.compare(password, user.password);
    // throw an error if isn't correct
    if (!comparePassword) {
      throw new BadRequestException('Email or password is incorrect');
    }

    return user;
  }
}
