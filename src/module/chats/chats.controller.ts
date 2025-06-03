import { Controller, Post, Body, UseGuards, Get, Param, Patch, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Chat } from '../../entities/chat.entity';
import { Message } from '../../entities/message.entity';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, description: 'The chat has been successfully created.', type: Chat })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateChatDto })
  @UseGuards(JwtAuthGuard)
  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.createChat(createChatDto);
  }

  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiResponse({ status: 201, description: 'The message has been successfully sent.', type: Message })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateMessageDto })
  @UseGuards(JwtAuthGuard)
  @Post('messages')
  sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatsService.sendMessage(createMessageDto);
  }

  @ApiOperation({ summary: 'Remove a user from a group chat' })
  @ApiResponse({ status: 200, description: 'The user has been successfully removed from the group chat.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'chatId', type: 'number', description: 'The ID of the chat' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The ID of the user to remove' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':chatId/user/:userId')
  removeUserFromGroup(@Param('chatId') chatId: number, @Param('userId') userId: string) {
    return this.chatsService.removeUserFromGroup(chatId, userId);
  }

  @ApiOperation({ summary: 'Block a user in a private chat' })
  @ApiResponse({ status: 200, description: 'The user has been successfully blocked.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The ID of the user to block' })
  @UseGuards(JwtAuthGuard)
  @Patch('block/:userId')
  blockUser(@Param('userId') userId: string, @Req() req: any) {
    const blockedUserId = req.user.id;
    return this.chatsService.blockUser(userId, blockedUserId);
  }

  @ApiOperation({ summary: 'Get a chat with a user and the messages in it' })
  @ApiResponse({ status: 200, description: 'The chat and messages have been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  @ApiParam({ name: 'otherUserId', type: 'string', description: 'The ID of the other user' })
  @UseGuards(JwtAuthGuard)
  @Get('with/:otherUserId')
  async getChatWithUser(@Param('otherUserId') otherUserId: string, @Req() req: any) {
    const userId = req.user.id;
    try {
      return await this.chatsService.getChatWithUser(userId, otherUserId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Chat not found');
      }
      throw error;
    }
  }
}
