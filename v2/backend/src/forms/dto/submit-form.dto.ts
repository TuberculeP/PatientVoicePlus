import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'

export class AnswerDto {
  @IsInt()
  @IsPositive()
  question_id: number

  @IsString()
  @MaxLength(10)
  value: string

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string
}

export class SubmitFormDto {
  @IsUUID(4)
  center_id: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[]
}
