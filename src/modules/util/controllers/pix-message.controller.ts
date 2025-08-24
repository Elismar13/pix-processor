import {
  Controller,
  Post,
  Param,
  Body,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PixMessageService } from '../services/pix-message.service';

@ApiTags('Util')
@Controller('util/msgs')
export class PixMessageController {
  constructor(private readonly pixMessageService: PixMessageService) {}

  @Post(':ispb/:number')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple random PIX messages' })
  @ApiParam({
    name: 'ispb',
    description: 'ISPB of the receiving institution',
    example: '32074986',
  })
  @ApiParam({
    name: 'number',
    description: 'Number of messages to create',
    example: '5',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Messages created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  async createMultiple(
    @Param('ispb') ispb: string,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.pixMessageService.createMultiple(ispb, number);
  }
}
