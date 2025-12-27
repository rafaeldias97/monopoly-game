import { Test, TestingModule } from '@nestjs/testing';
import { GameUsersService } from './game-users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameUser } from './game-user';
import { Game } from '../games/game';
import { User } from '../users/users';

describe('GameUsersService', () => {
  let service: GameUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameUsersService,
        {
          provide: getRepositoryToken(GameUser),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Game),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GameUsersService>(GameUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
