import { BadRequestException, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, dto: UserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    return user;
  }

  async changeUserRole(userId: string, role: string): Promise<User> {
    let roleValue: Role;
    switch (role) {
      case 'admin':
        roleValue = Role.ADMIN;
        break;
      case 'manager':
        roleValue = Role.MANAGER;
        break;
      case 'user':
        roleValue = Role.USER;
        break;
      default:
        throw new BadRequestException('Improper Role');
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: roleValue,
      },
    });

    return user;
  }
}
