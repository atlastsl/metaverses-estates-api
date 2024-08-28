import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum UserStatus {
    SUSPENDED = 'SUSPENDED',
    ACTIVE = 'ACTIVE',
}

@Schema()
export class User {
    @ApiProperty()
    @Prop({ required: true })
    user_id: string;
    @ApiProperty()
    @Prop({ required: true })
    username: string;
    @Prop({ required: true })
    password: string;
    @ApiProperty()
    @Prop({ required: true, type: String, enum: UserRole })
    role: UserRole;
    @ApiProperty()
    @Prop({ required: true, type: String, enum: UserStatus })
    status: UserStatus;
    @ApiProperty()
    @Prop()
    created_at: Date;
    @ApiProperty()
    @Prop()
    updated_at: Date;
}

//export type UserEntity = HydratedDocument<User>;

export type UserEntity = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
