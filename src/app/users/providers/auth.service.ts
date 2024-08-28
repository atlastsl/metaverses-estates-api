import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHelperService } from '../../../helpers/services/password.helper.service';
import {
    UserAccessTokenResponseDto,
    UserLoginResponseDto,
} from '../dto/users.responses.dto';
import { UserErrors } from '../errors/errors';
import { InjectModel } from '@nestjs/mongoose';
import { DATABASE_CONNECTION_USERS } from '../../../main/databases/databases';
import { Model } from 'mongoose';
import { UserLoginDto } from '../dto/users.requests.dto';
import { User, UserStatus } from '../entities/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name, DATABASE_CONNECTION_USERS)
        private userModel: Model<User>,
        private jwtService: JwtService,
        private usersService: UsersService,
        private passwordsService: PasswordHelperService,
    ) {}

    async login(payload: UserLoginDto): Promise<UserLoginResponseDto> {
        const { username, password } = payload;
        const user = await this.userModel
            .findOne({ username: username })
            .exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        if (!this.passwordsService.compare(password, user.password)) {
            throw new BadRequestException(
                UserErrors['USER_PASSWORD_INCORRECT'],
            );
        }
        if (user.status !== UserStatus.ACTIVE) {
            throw new BadRequestException(UserErrors['USER_ACCOUNT_SUSPENDED']);
        }
        const usrPayload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            status: user.status,
        };
        const accessToken = await this.jwtService.signAsync(usrPayload);
        return {
            access_token: accessToken,
            user: await this.usersService.returnUserByUserId(user.user_id),
        };
    }

    async refreshToken(userId: string): Promise<UserAccessTokenResponseDto> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        const usrPayload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            status: user.status,
        };
        const accessToken = await this.jwtService.signAsync(usrPayload);
        return {
            access_token: accessToken,
        };
    }
}
