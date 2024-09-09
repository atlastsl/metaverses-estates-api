import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { Public } from '../../../main/apiutils/api.decorators';
import { UserLoginDto } from '../dto/users.requests.dto';
import {
    UserAccessTokenResponseDto,
    UserLoginResponseDto,
} from '../dto/users.responses.dto';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { IAppErrorDto } from '../../../main/errors/apperror';

@ApiTags('Auth')
@ApiResponse({
    status: '4XX',
    type: IAppErrorDto,
})
@ApiResponse({
    status: '5XX',
    type: IAppErrorDto,
})
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOkResponse({
        type: UserLoginResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @Public()
    async login(@Body() loginDto: UserLoginDto): Promise<UserLoginResponseDto> {
        return this.authService.login(loginDto);
    }

    @ApiOkResponse({
        type: UserAccessTokenResponseDto,
    })
    @ApiBearerAuth()
    @Get('token')
    async getProfile(@Req() req): Promise<UserAccessTokenResponseDto> {
        return this.authService.refreshToken(req.user.user_id as string);
    }
}
