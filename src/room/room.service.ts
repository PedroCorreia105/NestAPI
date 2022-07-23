import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, Room, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { RoomDto } from './dto';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async getAllRooms(user: User): Promise<Room[]> {
    if (user.role !== Role.ADMIN)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.room.findMany({
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    const usersOnRoom = await this.prisma.usersOnRoom.findMany({
      where: {
        userId: userId,
      },
      include: {
        room: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return usersOnRoom.map((res) => res.room);
  }

  async getRoomById(userId: string, roomId: string): Promise<Room> {
    const usersOnRoom = await this.prisma.usersOnRoom.findUnique({
      where: {
        userId_roomId: {
          userId: userId,
          roomId: roomId,
        },
      },
      include: {
        room: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!usersOnRoom) throw new NotFoundException('Room not Found');

    return usersOnRoom.room;
  }

  async createRoom(userId: string, dto: RoomDto): Promise<Room> {
    const room = await this.prisma.room.create({
      data: {
        ...dto,
        users: {
          create: [
            {
              userId: userId,
              isOwner: true,
            },
          ],
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
    return room;
  }

  async editRoomById(userId: string, roomId: string, dto: RoomDto): Promise<Room> {
    const usersOnRoom = await this.prisma.usersOnRoom.findUnique({
      where: {
        userId_roomId: {
          roomId: roomId,
          userId: userId,
        },
      },
    });

    if (!usersOnRoom) throw new NotFoundException('Room not Found');

    if (!usersOnRoom.isOwner) throw new ForbiddenException('Access to resources denied');

    return this.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        ...dto,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async deleteRoomById(userId: string, roomId: string) {
    const usersOnRoom = await this.prisma.usersOnRoom.findUnique({
      where: {
        userId_roomId: {
          roomId: roomId,
          userId: userId,
        },
      },
    });

    if (!usersOnRoom) throw new NotFoundException('Room not Found');

    if (!usersOnRoom.isOwner) throw new ForbiddenException('Access to resources denied');

    await this.prisma.room.delete({
      where: {
        id: roomId,
      },
    });
  }

  async addUserToRoom(ownerId: string, roomId: string, userId: string) {
    const usersOnRoom = await this.prisma.usersOnRoom.findUnique({
      where: {
        userId_roomId: {
          roomId: roomId,
          userId: ownerId,
        },
      },
    });

    if (!usersOnRoom) throw new NotFoundException('Room not Found');

    if (!usersOnRoom.isOwner) throw new ForbiddenException('Access to resources denied');

    const userToAdd = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userToAdd) throw new NotFoundException('User not Found');

    return await this.prisma.usersOnRoom.create({
      data: {
        userId: userId,
        roomId: roomId,
      },
    });
  }

  async removeUserFromRoom(ownerId: string, roomId: string, userId: string) {
    const usersOnRoom = await this.prisma.usersOnRoom.findUnique({
      where: {
        userId_roomId: {
          userId: ownerId,
          roomId: roomId,
        },
      },
    });

    if (!usersOnRoom) throw new NotFoundException('Room not Found');

    if (!usersOnRoom.isOwner) throw new ForbiddenException('Access to resources denied');

    const userToRemove = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userToRemove) throw new NotFoundException('User not Found');

    return await this.prisma.usersOnRoom.delete({
      where: {
        userId_roomId: {
          userId: userId,
          roomId: roomId,
        },
      },
    });
  }
}
