import { ArrayMaxSize, IsArray, IsOptional, IsString, Length } from 'class-validator';

export class ChatDto {
  @IsString()
  @Length(1, 500)
  mensagem!: string;

  // Turnos anteriores da conversa; o serviço valida o formato de cada item.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  historico?: unknown[];
}
