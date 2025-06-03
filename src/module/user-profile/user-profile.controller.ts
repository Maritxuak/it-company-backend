import { Controller, Patch, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../../enum/user-role.enum';
import { Project } from '../../entities/project.entity';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'The profile has been successfully updated.', type: UserProfileDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: UpdateProfileDto })
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userProfileService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Change the role of a user.
   * Only accessible by administrators.
   * @param userId The ID of the user whose role is to be changed.
   * @param role The new role to assign to the user.
   * @returns The updated user object.
   */
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'The user role has been successfully changed.', type: UserProfileDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('change-role')
  changeRole(@Body('userId') userId: string, @Body('role') role: UserRole) {
    return this.userProfileService.changeRole(userId, role);
  }

  /**
   * Get the profile of the current user.
   * @returns The profile of the current user.
   */
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'The profile of the current user.', type: UserProfileDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUserProfile(@Req() req) {
    return req.user;
  }

  /**
   * Get the profile of a user by ID.
   * Only accessible by administrators.
   * @param userId The ID of the user whose profile is to be retrieved.
   * @returns The profile of the specified user.
   */
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'The profile of the specified user.', type: UserProfileDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The ID of the user whose profile is to be retrieved' })
  @Roles('admin')
  @Get(':userId')
  getUserProfileById(@Param('userId') userId: string) {
    return this.userProfileService.getUserProfile(userId);
  }

  /***
   * Get all projects a user is working on.
   * @param userId The ID of the user whose projects are to be retrieved.
   * @returns The list of projects the user is working on.
   */
  @ApiOperation({ summary: 'Get user projects' })
  @ApiResponse({ status: 200, description: 'The list of projects the user is working on.', type: [Project] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'userId', type: 'string', description: 'The ID of the user whose projects are to be retrieved' })
  @Roles('admin')
  @Get(':userId/projects')
  getUserProjects(@Param('userId') userId: string) {
    return this.userProfileService.getUserProjects(userId);
  }

  /***
   * Get all users with their details.
   * @returns A list of users with their ID, first name, last name, and email.
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'A list of users with their details.', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAllUsers() {
    return this.userProfileService.getAllUsersWithDetails();
  }
}
