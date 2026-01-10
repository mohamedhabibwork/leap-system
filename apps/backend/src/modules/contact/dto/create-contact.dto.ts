import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the contact' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'General Inquiry', description: 'Subject of the message' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  subject: string;

  @ApiProperty({ example: 'I have a question about...', description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;
}
