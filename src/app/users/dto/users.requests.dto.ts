import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    username: string;
    @ApiProperty({ type: String })
    @IsNotEmpty()
    password: string;
}

export class UpdateRoleDto {
    @ApiProperty({ enum: Object.values(UserRole) })
    @IsEnum(UserRole)
    role: UserRole;
}

export class UpdateStatusDto {
    @ApiProperty({ enum: Object.values(UserStatus) })
    @IsEnum(UserStatus)
    status: UserStatus;
}

export class UpdatePasswordDto {
    @ApiProperty({ type: String })
    @IsString()
    old_password: string;
    @ApiProperty({ type: String })
    @IsString()
    @IsStrongPassword()
    new_password: string;
}

export class UpdateUsernameDto {
    @ApiProperty({ type: String })
    @IsString()
    new_username: string;
}

export class RegisterUserDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    username: string;
    @ApiProperty({ enum: Object.values(UserRole) })
    @IsEnum(UserRole)
    role: UserRole = UserRole.ADMIN;
    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    @IsStrongPassword()
    password?: string;
}
