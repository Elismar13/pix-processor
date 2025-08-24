import { Controller } from '@nestjs/common';
import { PixService } from '../services/pix.service';

@Controller('pix')
export class PixController {
  constructor(private readonly pixService: PixService) {}
}
