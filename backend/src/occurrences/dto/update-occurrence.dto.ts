import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateOccurrenceDto {
  @IsOptional()
  @IsIn(['lixo', 'poluicao_sonora', 'animal', 'seguranca', 'outro'])
  tipo?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  local?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsOptional()
  @IsIn(['baixo', 'medio', 'alto'])
  impacto?: string;
}