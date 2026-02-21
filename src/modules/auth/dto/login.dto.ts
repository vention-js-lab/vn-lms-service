// import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  // @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  // @Transform(({ value }) => value.trim())
  @MinLength(6, { message: 'Password length is less that required' })
  @MaxLength(22, { message: 'Password length is more than required' })
  password: string;
}
