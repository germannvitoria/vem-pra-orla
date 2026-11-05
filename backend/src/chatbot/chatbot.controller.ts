import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ChatbotService } from './chatbot.service.js';
import { ChatDto } from './dto/chat.dto.js';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @UseGuards(AuthGuard)
  async conversar(@Req() request: any, @Body() dto: ChatDto) {
    const resposta = await this.chatbotService.responder(request.user.id, dto.mensagem, dto.historico);
    return { resposta };
  }
}
