import { User } from '@prisma/client';

export class UserEntity {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role.toLowerCase();
    this.name = user.name;
  }
}
