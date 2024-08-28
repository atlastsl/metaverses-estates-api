import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false })
export class OperationValue {
    @ApiProperty({
        description: 'OperationValue Value',
        required: true,
    })
    @Prop({ required: true })
    value: number;

    @ApiProperty({
        description: 'OperationValue Currency',
        required: false,
    })
    @Prop({ required: false })
    currency: number;

    @ApiProperty({
        description: 'OperationValue Currency Price',
        required: false,
    })
    @Prop({ required: false })
    currency_price: number;

    @ApiProperty({
        description: 'OperationValue Value in $ USD',
        required: false,
    })
    @Prop({ required: false })
    value_usd: number;
}

export enum OperationType {
    Free = 'free',
    Sale = 'sale',
}

export enum TransactionType {
    Mint = 'mint',
    Transfer = 'transfer',
}

@Schema({ collection: 'operations' })
export class Operation {
    @ApiProperty({ description: 'Operation ID', type: String, required: true })
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    _id: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Operation NFT collection', required: true })
    @Prop({ required: true })
    collection: string;

    @ApiProperty({
        description: 'Operation Asset Unique ID',
        type: String,
        required: true,
    })
    @Prop({ required: true })
    asset: mongoose.Types.ObjectId;

    @ApiProperty({ description: 'Operation NFT contract', required: true })
    @Prop({ required: true })
    asset_contract: string;

    @ApiProperty({ description: 'Operation NFT Asset ID', required: true })
    @Prop({ required: true })
    asset_id: string;

    @ApiProperty({ description: 'Operation Transaction Hash', required: true })
    @Prop({ required: true })
    transaction_hash: string;

    @ApiProperty({
        description: 'Operation Type',
        required: true,
        enum: Object.values(OperationType),
    })
    @Prop({ required: true, enum: OperationType })
    operation_type: OperationType;

    @ApiProperty({
        description: 'Operation Transaction Type',
        required: true,
        enum: Object.values(TransactionType),
    })
    @Prop({ required: true, enum: TransactionType })
    transaction_type: TransactionType;

    @ApiProperty({
        description: 'Operation Blockchain Name',
        required: false,
    })
    @Prop({ required: false })
    chain: string;

    @ApiProperty({
        description: 'Operation Block number',
        required: true,
    })
    @Prop({ required: true })
    block_number: number;

    @ApiProperty({
        description: 'Operation Block Hash',
        required: true,
    })
    @Prop({ required: true })
    block_hash: string;

    @ApiProperty({
        description: 'Operation Date',
        required: true,
    })
    @Prop({ required: true })
    mvt_date: Date;

    @ApiProperty({
        description: 'Operation Sender',
        required: true,
    })
    @Prop({ required: true })
    sender: string;

    @ApiProperty({
        description: 'Operation Recipient',
        required: true,
    })
    @Prop({ required: true })
    recipient: string;

    @ApiProperty({
        description: 'Operation Amounts',
        required: true,
        type: [OperationValue],
    })
    @Prop({ required: true })
    amount: OperationValue[];

    @ApiProperty({
        description: 'Operation Fees',
        required: true,
        type: [OperationValue],
    })
    @Prop({ required: true })
    fees: OperationValue[];
}

export const OperationSchema = SchemaFactory.createForClass(Operation);
