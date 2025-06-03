import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { log } from 'console';
import { UserRole } from '../../enum/user-role.enum';
import { Project } from '../../entities/project.entity';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }

  async changeRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async getUserProfile(userId: string): Promise<User | UserResponseDto[]> {
    if (userId === 'all') {
      return this.getAllUsersWithDetails();
    }

    // Ensure we're using the correct type for the user ID
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findByIds(ids);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    // Ensure we're using the correct type for the user ID
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['projects'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.projects;
  }

  async getAllUsersWithDetails(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'profile'],
      relations: ['profile'],
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
    })) as UserResponseDto[];
  }
}
