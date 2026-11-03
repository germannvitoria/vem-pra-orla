import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  async enviar(para: string, assunto: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: para,
      subject: assunto,
      html,
    });
  }
}
