import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Auth, User } from '../../auth/auth.decorator';
import { CreateUserDto, CreateUserResponseDto } from '../dtos/user/create.dto';
import { AuthService, IUser } from '../../auth/auth.service';
import { HttpStatusCode } from 'axios';
import { UserService } from '../services/user';
import {
  Filtering,
  FilteringParams,
} from '@root/common/decorators/filter.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiResponsePaginated,
  ApiResponseSingle,
} from '@root/common/decorators/swagger.decorator';
import { ADMIN } from '@root/common/constants';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this.userService = userService;
    this.authService = authService;
  }

  @Auth()
  @HttpCode(HttpStatusCode.Created)
  @ApiResponseSingle(CreateUserResponseDto, HttpStatus.CREATED)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @User('sub') id: string) {
    const user = await this.userService.create({
      ...createUserDto,
      _id: id,
    });
    return user;
  }

  @Auth()
  @ApiResponseSingle(CreateUserResponseDto)
  @Get('me')
  async getMe(@User('sub') uid: string) {
    const user = await this.userService.findOneById(uid);
    return user;
  }

  @Auth(ADMIN)
  @ApiResponsePaginated(CreateUserResponseDto)
  @Get()
  async getAll(@FilteringParams(['email', 'auth0Id']) filters?: Filtering[]) {
    const users = await this.userService.find({ filters });
    return users;
  }
}