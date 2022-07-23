import { Role } from '@prisma/client';

export const users = [
  {
    id: '1',
    username: 'username 1 admin',
    name: 'name 1 admin',
    role: Role.ADMIN,
    email: 'user1@admin.com',
    hash: '',
  },
  {
    id: '2',
    username: 'username 2 admin',
    name: 'name 2 admin',
    role: Role.ADMIN,
    email: 'user2@admin.com',
    hash: '',
  },
  {
    id: '3',
    username: 'username 3 manager',
    name: 'name 3 manager',
    role: Role.MANAGER,
    email: 'user3@manager.com',
    hash: '',
  },
  {
    id: '4',
    username: 'username 4 manager',
    name: 'name 4 manager',
    role: Role.MANAGER,
    email: 'user4@manager.com',
    hash: '',
  },
  {
    id: '5',
    username: 'username 5 user',
    name: 'name 5 user',
    role: Role.USER,
    email: 'user5@user.com',
    hash: '',
  },
  {
    id: '6',
    username: 'username 6 user',
    name: 'name 6 user',
    role: Role.USER,
    email: 'user6@user.com',
    hash: '',
  },
];
