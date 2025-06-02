import {IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: 'Пароль должен содержать цифры, строчные и заглавные буквы'
  })
  password: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  lastName: string;
}