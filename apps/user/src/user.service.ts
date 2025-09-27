import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { PrismaService } from '@app/prisma'
import { RedisService } from '@app/redis'
import { RegisterUserDto } from './dto/register-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prismaService: PrismaService

  @Inject(RedisService)
  private redisService: RedisService

  @Inject(JwtService)
  private jwtService: JwtService

  private logger = new Logger()

  async register(data: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${data.email}`)
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }
    if (data.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST)
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
    })

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.prismaService.user.create({
        data: {
          username: data.username,
          password: data.password,
          email: data.email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createTime: true,
        },
      })
    } catch (e) {
      this.logger.error(e, UserService)
      return null
    }
  }

  async login(data: LoginUserDto) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: data.username,
      },
    })
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }
    if (foundUser.password !== data.password) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)
    }
    // @ts-ignore
    delete foundUser.password
    return {
      user: foundUser,
      token: this.jwtService.sign(
        {
          userId: foundUser.id,
          username: foundUser.username,
        },
        {
          expiresIn: '7d',
        },
      ),
    }
  }
}
