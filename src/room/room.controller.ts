import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Room, User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RoomService } from './room.service';
import { RoomDto, RoomEntity } from './dto';

@UseGuards(JwtGuard)
@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  @ApiOkResponse({ type: [RoomEntity] })
  async getAllRooms(@GetUser() user: User): Promise<RoomEntity[]> {
    const rooms = await this.roomService.getAllRooms(user);
    return rooms.map((room: Room) => new RoomEntity(room));
  }

  @Get('user')
  @ApiOkResponse({ type: [RoomEntity] })
  async getUserRooms(@GetUser('id') userId: string): Promise<RoomEntity[]> {
    const rooms = await this.roomService.getUserRooms(userId);
    return rooms.map((room: Room) => new RoomEntity(room));
  }

  @Get(':roomId')
  @ApiOkResponse({ type: [RoomEntity] })
  async getRoomById(
    @GetUser('id') userId: string,
    @Param('roomId') roomId: string,
  ): Promise<RoomEntity> {
    return new RoomEntity(await this.roomService.getRoomById(userId, roomId));
  }

  @Post()
  @ApiCreatedResponse({ type: [RoomEntity] })
  async createRoom(
    @GetUser('id') userId: string,
    @Body() dto: RoomDto,
  ): Promise<RoomEntity> {
    return new RoomEntity(await this.roomService.createRoom(userId, dto));
  }

  @Patch(':roomId')
  @ApiCreatedResponse({ type: [RoomEntity] })
  async editRoomById(
    @GetUser('id') userId: string,
    @Param('roomId') roomId: string,
    @Body() dto: RoomDto,
  ): Promise<RoomEntity> {
    return new RoomEntity(await this.roomService.editRoomById(userId, roomId, dto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':roomId')
  deleteRoomById(@GetUser('id') userId: string, @Param('roomId') roomId: string) {
    return this.roomService.deleteRoomById(userId, roomId);
  }

  @Post(':roomId/user/:userId')
  addUserToRoom(
    @GetUser('id') ownerId: string,
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    return this.roomService.addUserToRoom(ownerId, roomId, userId);
  }

  @Delete(':roomId/user/:userId')
  removeUserFromRoom(
    @GetUser('id') ownerId: string,
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    return this.roomService.removeUserFromRoom(ownerId, roomId, userId);
  }
}
