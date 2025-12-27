import { Test, TestingModule } from '@nestjs/testing';
import { GameUsersController } from './game-users.controller';
import { GameUsersService } from './game-users.service';

describe('GameUsersController', () => {
  let controller: GameUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameUsersController],
      providers: [
        {
          provide: GameUsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<GameUsersController>(GameUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
