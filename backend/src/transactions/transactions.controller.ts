import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction';
import { CreateTransactionDto } from './create-transaction.dto';
import { StartGameDto } from './start-game.dto';
import { TransferMoneyDto } from './transfer-money.dto';
import { ReceiveFromBankDto } from './receive-from-bank.dto';
import { TransferToBankDto } from './transfer-to-bank.dto';
import { User } from '../users/users';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.decorator';

@Controller('transactions')
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game or User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: CreateTransactionDto })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Transaction> {
    return this.transactionsService.createTransaction(user.id, dto);
  }

  @Post('start-game')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start a game and create initial balance for all users',
  })
  @ApiResponse({
    status: 201,
    description: 'Game started successfully with initial transactions',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: StartGameDto })
  async startGame(@Body() dto: StartGameDto): Promise<Transaction[]> {
    return this.transactionsService.startGame(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Transactions fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllTransactions(): Promise<Transaction[]> {
    return this.transactionsService.findAllTransactions();
  }

  @Get('game/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transactions for a specific game' })
  @ApiResponse({
    status: 200,
    description: 'Transactions fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findTransactionsByGameId(
    @Param('gameId') gameId: string,
  ): Promise<Transaction[]> {
    return this.transactionsService.findTransactionsByGameId(gameId);
  }

  @Get('my-transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transactions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Transactions fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findMyTransactions(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Transaction[]> {
    return this.transactionsService.findTransactionsByUserId(user.id);
  }

  @Get('balance/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user balance and transactions for a specific game',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance and transactions fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMyBalance(
    @Param('gameId') gameId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ balance: number; transactions: Transaction[] }> {
    return this.transactionsService.getUserBalance(user.id, gameId);
  }

  @Get('game/:gameId/players-balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get balance of all players in a game',
  })
  @ApiResponse({
    status: 200,
    description: 'Players balance fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllPlayersBalance(@Param('gameId') gameId: string): Promise<
    Array<{
      userId: string;
      user: User;
      balance: number;
      finishedAt: Date | null;
    }>
  > {
    return this.transactionsService.getAllPlayersBalance(gameId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiResponse({
    status: 200,
    description: 'Transaction fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOneTransaction(
    @Param('id') id: string,
  ): Promise<Transaction | null> {
    return this.transactionsService.findOneTransaction(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction cancelled successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async cancelTransaction(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.cancelTransaction(id);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer money from one player to another' })
  @ApiResponse({
    status: 201,
    description: 'Money transferred successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game or User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: TransferMoneyDto })
  async transferMoney(
    @Body() dto: TransferMoneyDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{
    fromTransaction: Transaction;
    toTransaction: Transaction;
  }> {
    return this.transactionsService.transferMoney(user.id, dto);
  }

  @Post('receive-from-bank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receive money from bank' })
  @ApiResponse({
    status: 201,
    description: 'Money received from bank successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game or User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ReceiveFromBankDto })
  async receiveFromBank(
    @Body() dto: ReceiveFromBankDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Transaction> {
    return this.transactionsService.receiveFromBank(user.id, dto);
  }

  @Post('transfer-to-bank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer money to bank' })
  @ApiResponse({
    status: 201,
    description: 'Money transferred to bank successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Game or User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: TransferToBankDto })
  async transferToBank(
    @Body() dto: TransferToBankDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Transaction> {
    return this.transactionsService.transferToBank(user.id, dto);
  }
}
