import { IsArray, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCenterDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  address?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  specialtyIds?: number[];
}
