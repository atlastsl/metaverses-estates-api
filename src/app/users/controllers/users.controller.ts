import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from '../providers/users.service';
import { RolesGuard } from '../providers/roles.guard';
import {
    UserDetailResponseDto,
    UserListResponseDto,
} from '../dto/users.responses.dto';
import { UserRole } from '../entities/user.schema';
import { Roles } from '../providers/auth.roles.decorator';
import { PaginationPayloadDto, PaginationResponseDto } from '../../../main/apiutils/pagination';
import {
    RegisterUserDto,
    UpdateRoleDto,
    UpdateStatusDto,
} from '../dto/users.requests.dto';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { IAppError } from '../../../main/errors/apperror';

@ApiTags('Users')
@ApiResponse({
    status: '4XX',
    type: IAppError,
})
@ApiResponse({
    status: '5XX',
    type: IAppError,
})
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get('my-account')
    async getMyAccount(@Req() req): Promise<UserDetailResponseDto> {
        const user = await this.usersService.returnUserByUserId(
            req.user.user_id,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Patch('my-account/username')
    async changeMyUsername(
        @Req() req,
        @Body('new_username') newUsername: string,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.changeUsername(
            req.user.user_id,
            newUsername,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Patch('my-account/password')
    async changeMyPassword(
        @Req() req,
        @Body('old_password') oldPassword: string,
        @Body('new_password') newPassword: string,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.changePassword(
            req.user.user_id,
            oldPassword,
            newPassword,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Patch(':user_id/password')
    @Roles(UserRole.ADMIN)
    async resetPassword(
        @Param('user_id') user_id: string,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.resetPassword(user_id);
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Patch(':user_id/role')
    @Roles(UserRole.ADMIN)
    async changeRole(
        @Param('user_id') user_id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.changeUserRole(
            user_id,
            updateRoleDto.role,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.ACCEPTED)
    @Patch(':user_id/status')
    @Roles(UserRole.ADMIN)
    async changeStatus(
        @Param('user_id') user_id: string,
        @Body() updateStatusDto: UpdateStatusDto,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.changeUserStatus(
            user_id,
            updateStatusDto.status,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.CREATED)
    @Post()
    @Roles(UserRole.ADMIN)
    async registerUser(
        registerUserDto: RegisterUserDto,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.registerUser(
            registerUserDto.username,
            registerUserDto.role,
        );
        return {
            user: user,
        };
    }

    @ApiOkResponse({
        type: UserListResponseDto,
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.ADMIN)
    async listUsers(
        @Req() req,
        @Query() pagination: PaginationPayloadDto,
    ): Promise<UserListResponseDto> {
        const { users, total } = await this.usersService.listAllUsers(
            pagination,
            req.user?.user_id as string,
        );
        const paginationRes = PaginationResponseDto.responseDto(
            pagination,
            total,
        );
        return {
            users: users,
            pagination: paginationRes,
        };
    }

    @ApiOkResponse({
        type: UserDetailResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Get(':user_id')
    @Roles(UserRole.ADMIN)
    async detailsUser(
        @Param('user_id') user_id: string,
    ): Promise<UserDetailResponseDto> {
        const user = await this.usersService.returnUserByUserId(user_id);
        return {
            user: user,
        };
    }
}
