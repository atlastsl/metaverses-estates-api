import { IsEnum, IsNotEmpty } from 'class-validator';
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

export class RegisterUserDto {
    @IsNotEmpty()
    username: string;
    @ApiProperty({ enum: Object.values(UserStatus) })
    @IsEnum(UserRole)
    role: UserRole;
}
