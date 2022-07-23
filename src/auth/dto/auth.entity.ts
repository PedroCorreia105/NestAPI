export class AuthEntity {
  accessToken: string;
  userId: string;

  constructor(token: string, id: string) {
    this.accessToken = token;
    this.userId = id;
  }
}
