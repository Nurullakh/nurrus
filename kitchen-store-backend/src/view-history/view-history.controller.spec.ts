import { Test, TestingModule } from '@nestjs/testing';
import { ViewHistoryController } from './view-history.controller';

describe('ViewHistoryController', () => {
  let controller: ViewHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewHistoryController],
    }).compile();

    controller = module.get<ViewHistoryController>(ViewHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
