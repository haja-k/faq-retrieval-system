import { IsString, IsArray, IsOptional, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  lang?: string = 'en';
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  answer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  lang?: string;
}

export class AskDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  lang?: string = 'en';
}

export interface FaqResult {
  id: number;
  question: string;
  answer: string;
  tags: string[];
  score: number;
}

export interface AskResponse {
  results: FaqResult[];
  ambiguous?: boolean;
  message?: string;
}