import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import {
  User,
  InsertUser,
  UpdateUser,
  PublicUser,
} from '../../database/schemas/users.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findActiveByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findActiveByEmail(email);
  }

  async create(userData: InsertUser): Promise<User> {
    return await this.userRepository.create(userData);
  }

  async updateById(id: string, userData: UpdateUser): Promise<User | null> {
    return await this.userRepository.updateById(id, userData);
  }

  async deleteById(id: string): Promise<boolean> {
    return await this.userRepository.deleteById(id);
  }

  async softDeleteById(id: string): Promise<boolean> {
    return await this.userRepository.softDeleteById(id);
  }

  async verifyEmail(id: string): Promise<boolean> {
    return await this.userRepository.verifyEmail(id);
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    return await this.userRepository.findAll(limit, offset);
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  // Helper method to get public user data (without password)
  toPublicUser(user: User): PublicUser {
    return this.userRepository.toPublicUser(user);
  }
}
