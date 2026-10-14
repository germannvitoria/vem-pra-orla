import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOccurrenceDto {
  @IsIn(['lixo', 'poluicao_sonora', 'animal', 'seguranca', 'outro'])
  tipo!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  local!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsIn(['baixo', 'medio', 'alto'])
  impacto!: string;
}