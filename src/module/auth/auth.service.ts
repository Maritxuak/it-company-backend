import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if firstName and lastName are provided
    if (!firstName || !lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Email уже занят');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profile = this.profileRepository.create({
      firstName,
      lastName
    });

    // Save the profile first
    const savedProfile = await this.profileRepository.save(profile);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      profile: savedProfile
    });

    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile']
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return this.generateToken(user);
  }

  async generateToken(user: User): Promise<{ accessToken: string }> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
