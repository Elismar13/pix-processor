import { Test, TestingModule } from '@nestjs/testing';
import { PixMessageController } from '../controllers/pix-message.controller';
import { PixMessageService } from '../services/pix-message.service';

describe('PixMessageController', () => {
  let controller: PixMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PixMessageController],
      providers: [PixMessageService],
    }).compile();

    controller = module.get<PixMessageController>(PixMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
