import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(user: RegisterAuthDto) {
    return (await this.usersService.findUserByEmail(user.email))
      ? null
      : { message: 'No hay usuario' };
  }
}
