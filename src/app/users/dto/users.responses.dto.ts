import { User } from '../entities/user.schema';
import { PaginationResponseDto } from '../../../main/apiutils/pagination';
import { ApiProperty } from '@nestjs/swagger';

export class UserDetailResponseDto {
    @ApiProperty({ type: User })
    user: User;
}

export class UserPasswordResponseDto {
    @ApiProperty({ type: String })
    password: string;
}

export class UserWithPasswordResponseDto extends UserDetailResponseDto {
    @ApiProperty({ type: String })
    password: string;
}

export class UserAccessTokenResponseDto {
    @ApiProperty()
    access_token: string;
}

export class UserLoginResponseDto {
    @ApiProperty({ type: User })
    user: User;
    @ApiProperty()
    access_token: string;
}

export class UserListResponseDto {
    @ApiProperty({ type: PaginationResponseDto })
    pagination: PaginationResponseDto;
    @ApiProperty({ type: [User] })
    users: User[];
}
