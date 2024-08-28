import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationPayloadDto {
    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    take?: number = 50;
}

export class PaginationResponseDto {
    @ApiProperty({ type: Number })
    page: number;
    @ApiProperty({ type: Number })
    take: number;
    @ApiProperty({ required: false, type: Number })
    next_page?: number;
    @ApiProperty({ required: false, type: Number })
    previous_page?: number;
    @ApiProperty({ type: Number })
    total: number;

    static responseDto(
        requestPayload: PaginationPayloadDto,
        total: number = 0,
    ): PaginationResponseDto {
        const response = new PaginationResponseDto();
        response.page = requestPayload.page;
        response.take = requestPayload.take;
        if (requestPayload.page > 1) {
            response.previous_page = requestPayload.page - 1;
        } else if (requestPayload.page * requestPayload.take < total) {
            response.next_page = requestPayload.page + 1;
        }
        response.total = total;
        return response;
    }
}
