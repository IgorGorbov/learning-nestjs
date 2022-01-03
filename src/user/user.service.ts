import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { UserEntity } from '@app/user/user.entity';
import { UserResponse } from '@app/user/types/userResponse.interface';
import { CreateUserDto, LoginUserDto } from '@app/user/dto/createUser.dto';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existedUser = this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existedUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new HttpException(
        'Credential are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = compare(loginUserDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Credential are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return user;
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userRepository.save({ id: userId, ...updateUserDto });
  }

  buildUserResponse(user: UserEntity): UserResponse {
    const { id, username, email, bio, image, favorites } = user;

    return {
      user: {
        id,
        username,
        email,
        bio,
        image,
        favorites,
        token: this.generateJwt(user),
      },
    };
  }

  generateJwt({ id, username, email }: UserEntity) {
    return sign({ id, username, email }, process.env.JWT_SECRET);
  }
}
