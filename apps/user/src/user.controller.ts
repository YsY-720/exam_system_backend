import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  SetMetadata,
} from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { EmailService } from '@app/email'
import { RedisService } from '@app/redis'
import { LoginUserDto } from './dto/login-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private readonly emailService: EmailService

  @Inject(RedisService)
  private readonly redisService: RedisService

  @Get('register-captcha')
  async sendCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8)
    await this.redisService.set(`captcha_${address}`, code, 5 * 60)
    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<p>您的验证码是: ${code}</p>`,
    })

    return '发送成功'
  }

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto)
  }

  @Get('aaa')
  @SetMetadata('require-login', true)
  @SetMetadata('test', 123)
  aaa() {
    return 'aaa'
  }

  @Get('bbb')
  bbb() {
    return 'bbb'
  }
}
