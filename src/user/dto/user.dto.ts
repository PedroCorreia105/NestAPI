import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({
    default: 'email@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
}
