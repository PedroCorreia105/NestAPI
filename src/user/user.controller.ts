import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserDto, UserEntity } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User): UserEntity {
    return new UserEntity(user);
  }

  @Patch()
  async editUser(
    @GetUser('id') userId: string,
    @Body() dto: UserDto,
  ): Promise<UserEntity> {
    return new UserEntity(await this.userService.editUser(userId, dto));
  }

  @Patch('/role')
  async changeUserRole(
    @GetUser('id') userId: string,
    @Query('role') role: string,
  ): Promise<UserEntity> {
    return new UserEntity(await this.userService.changeUserRole(userId, role));
  }
}
