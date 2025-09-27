import { Injectable } from '@nestjs/common'
import { createTransport, Transporter } from 'nodemailer'

@Injectable()
export class EmailService {
  transporter: Transporter

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '2285683024@qq.com',
        pass: 'cxvqsciydazxebgg',
      },
    })
  }

  async sendEmail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: 'exam system',
        address: '2285683024@qq.com',
      },
      to,
      subject,
      html,
    })
  }
}
