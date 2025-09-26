import { Module } from '@nestjs/common'
import { ExamController } from './exam.controller'
import { ExamService } from './exam.service'
import { RedisService } from '@app/redis'

@Module({
  imports: [RedisService],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
