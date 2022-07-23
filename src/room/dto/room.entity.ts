import { Prisma, User } from '@prisma/client';

import { UserEntity } from '../../user/dto';

export class RoomEntity {
  id: string;
  title: string;
  description: string | null;
  link: string;
  users?: UserEntity[];

  constructor(room: Prisma.RoomCreateInput) {
    this.id = room.id ?? '';
    this.title = room.title ?? '';
    this.description = room.description ?? '';
    this.link = room.link ?? '';

    this.users = (room.users as Prisma.UsersOnRoomCreateInput[]).map(
      (userOnRoom: Prisma.UsersOnRoomCreateInput) =>
        new UserEntity(userOnRoom.user as User),
    );
  }
}
