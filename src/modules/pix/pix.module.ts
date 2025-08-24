import { Module } from '@nestjs/common';
import { PixService } from './services/pix.service';
import { PixController } from './controllers/pix.controller';

@Module({
  controllers: [PixController],
  providers: [PixService],
})
export class PixModule {}
