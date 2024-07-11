import { Test, TestingModule } from '@nestjs/testing';
import { RagchainController } from './ragchain.controller';

describe('RagchainController', () => {
  let controller: RagchainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RagchainController],
    }).compile();

    controller = module.get<RagchainController>(RagchainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
