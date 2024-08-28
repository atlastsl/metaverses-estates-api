import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PasswordHelperService } from '../../../helpers/services/password.helper.service';
import { IdsHelperService } from '../../../helpers/services/ids.helper.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole, UserStatus } from '../entities/user.schema';
import { Model } from 'mongoose';
import { DATABASE_CONNECTION_USERS } from '../../../main/databases/databases';
import { UserErrors } from '../errors/errors';
import { PaginationPayloadDto } from '../../../main/apiutils/pagination';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name, DATABASE_CONNECTION_USERS)
        private readonly userModel: Model<User>,
        private readonly passwordHelperService: PasswordHelperService,
        private readonly idsHelperService: IdsHelperService,
        private readonly logger: Logger,
    ) {
        this.initAdmin().then();
    }

    private async initAdmin() {
        const superAdmin = await this.userModel
            .findOne({ username: 'admin' })
            .exec();
        if (!superAdmin) {
            const res = await this.registerUser(
                'admin',
                UserRole.ADMIN,
                '000000',
            );
            const superAdmin = res.user;
            this.logger.log(
                `User ${superAdmin.username} {Super Admin} successfully registered !`,
            );
        }
    }

    async returnUserByUsername(username: string): Promise<User> {
        return await this.userModel
            .findOne({ username })
            .select('-__v -password')
            .exec();
    }

    async returnUserByUserId(userId: string): Promise<User> {
        return await this.userModel
            .findOne({ user_id: userId })
            .select('-__v -password')
            .exec();
    }

    async changeUsername(userId: string, newUsername: string): Promise<User> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        const existing = await this.userModel
            .findOne({ username: newUsername })
            .exec();
        if (existing) {
            throw new BadRequestException(
                UserErrors['USERNAME_ALREADY_EXISTS'],
            );
        }
        user.username = newUsername;
        user.updated_at = new Date();
        await user.save();
        return this.returnUserByUserId(userId);
    }

    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
    ): Promise<User> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        if (!this.passwordHelperService.compare(oldPassword, user.password)) {
            throw new BadRequestException(
                UserErrors['USER_PASSWORD_INCORRECT'],
            );
        }
        user.password = this.passwordHelperService.encrypt(newPassword);
        user.updated_at = new Date();
        await user.save();
        return this.returnUserByUserId(userId);
    }

    async resetPassword(userId: string): Promise<string> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        const { clear, encrypted } = this.passwordHelperService.newPassword();
        user.password = encrypted;
        user.updated_at = new Date();
        await user.save();
        return clear;
    }

    async changeUserRole(userId: string, newRole: UserRole): Promise<User> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        user.role = newRole;
        user.updated_at = new Date();
        await user.save();
        return this.returnUserByUserId(userId);
    }

    async changeUserStatus(
        userId: string,
        newStatus: UserStatus,
    ): Promise<User> {
        const user = await this.userModel.findOne({ user_id: userId }).exec();
        if (!user) {
            throw new BadRequestException(UserErrors['USER_NOT_FOUND']);
        }
        user.status = newStatus;
        user.updated_at = new Date();
        await user.save();
        return this.returnUserByUserId(userId);
    }

    async registerUser(
        username: string,
        role: UserRole,
        password?: string,
    ): Promise<{ user: User; password: string }> {
        const existing = await this.userModel
            .findOne({ username: username })
            .exec();
        if (existing) {
            throw new BadRequestException(
                UserErrors['USERNAME_ALREADY_EXISTS'],
            );
        }
        const user = new this.userModel();
        user.user_id = this.idsHelperService.newShortId();
        user.username = username;
        let returnPassword = '';
        if (password) {
            user.password = this.passwordHelperService.encrypt(password);
            returnPassword = password;
        } else {
            const { clear, encrypted } =
                this.passwordHelperService.newPassword();
            user.password = encrypted;
            returnPassword = clear;
        }
        user.role = role;
        user.status = UserStatus.ACTIVE;
        user.created_at = new Date();
        user.updated_at = new Date();
        await user.save();
        return {
            user: await this.returnUserByUsername(username),
            password: returnPassword,
        };
    }

    async listAllUsers(
        pagination: PaginationPayloadDto,
        excluded?: string | string[],
    ): Promise<{ total: number; users: User[] }> {
        let payload: any = {};
        if (excluded) {
            let excludedArr: string[] = [];
            if (typeof excluded === 'string') {
                excludedArr = [excluded as string];
            } else {
                excludedArr = excluded as string[];
            }
            payload = { user_id: { $nin: excludedArr } };
        }
        const total = await this.userModel.countDocuments(payload).exec();
        const users = await this.userModel
            .find(payload)
            .select('-__v -password')
            .skip((pagination.page - 1) * pagination.take)
            .limit(pagination.take)
            .exec();
        return { total, users };
    }
}
