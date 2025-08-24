import { Test, TestingModule } from '@nestjs/testing';
import { PixMessageService } from '../services/pix-message.service';

describe('PixMessageService', () => {
  let service: PixMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PixMessageService],
    }).compile();

    service = module.get<PixMessageService>(PixMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
