import { IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsBoolean()
  notificacoesAtivas!: boolean;
}