import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Game, GameStatus } from '../games/game';
import { Transaction } from '../transactions/transaction';
import { GameUser } from '../game-users/game-user';

// Intervalo da cron job: '0 0 * * *' = todos os dias à meia-noite
const CLEANUP_CRON_EXPRESSION = '0 0 * * *';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(GameUser)
    private gameUsersRepository: Repository<GameUser>,
  ) {}

  // Executa conforme CLEANUP_CRON_EXPRESSION (todos os dias à meia-noite)
  @Cron(CLEANUP_CRON_EXPRESSION)
  async cleanupFinishedGames() {
    this.logger.log('Iniciando limpeza de jogos finalizados...');

    try {
      // Calcular a data de uma semana atrás
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Buscar todos os jogos com status FINISHED que foram atualizados há mais de uma semana
      const finishedGames = await this.gamesRepository.find({
        where: {
          status: GameStatus.FINISHED,
          updatedAt: LessThan(oneWeekAgo),
        },
      });

      if (finishedGames.length === 0) {
        this.logger.log('Nenhum jogo finalizado encontrado para limpar.');
        return;
      }

      this.logger.log(
        `Encontrados ${finishedGames.length} jogos finalizados para limpar.`,
      );

      let deletedGames = 0;
      let deletedTransactions = 0;
      let deletedGameUsers = 0;

      for (const game of finishedGames) {
        // Deletar transações relacionadas ao jogo (soft delete)
        const transactionResult = await this.transactionsRepository.softDelete({
          gameId: game.id,
        });
        deletedTransactions += transactionResult.affected || 0;

        // Deletar game-users relacionados ao jogo (soft delete)
        const gameUserResult = await this.gameUsersRepository.softDelete({
          gameId: game.id,
        });
        deletedGameUsers += gameUserResult.affected || 0;

        // Deletar o jogo (soft delete)
        await this.gamesRepository.softDelete(game.id);
        deletedGames++;

        this.logger.log(
          `Jogo ${game.id} (${game.name}) limpo: ${transactionResult.affected || 0} transações, ${gameUserResult.affected || 0} game-users`,
        );
      }

      this.logger.log(
        `Limpeza concluída: ${deletedGames} jogos, ${deletedTransactions} transações, ${deletedGameUsers} game-users deletados.`,
      );
    } catch (error) {
      this.logger.error('Erro ao limpar jogos finalizados:', error);
    }
  }
}
