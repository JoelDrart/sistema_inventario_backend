import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { AssignUserSucursalDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('assignsucursal')
  @HttpCode(200)
  async assignSucursal(@Body() body: AssignUserSucursalDto) {
    // Aquí iría la lógica para asignar una sucursal a un usuario
    return this.usersService.assignSucursalToUser(body.userId, body.sucursalId);
  }
}
