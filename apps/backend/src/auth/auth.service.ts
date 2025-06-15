import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../common/services/user.service';
import { PublicUser } from '../database/schemas/users.schema';
import { RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export type SafeUser = PublicUser;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.userService.findActiveByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.userService.toPublicUser(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.userService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: registerDto.role || 'user', // Default to 'user' role
      emailVerified: false,
      isActive: true,
    });

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    };
  }

  async login(user: SafeUser): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateToken(token: string): Promise<SafeUser | null> {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Validate that the decoded token has the expected structure
      if (
        decoded &&
        typeof decoded === 'object' &&
        'sub' in decoded &&
        'email' in decoded &&
        'name' in decoded &&
        'role' in decoded
      ) {
        // Get fresh user data from database to ensure role is current
        const user = await this.userService.findById(decoded.sub);
        if (user && user.isActive) {
          return this.userService.toPublicUser(user);
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
