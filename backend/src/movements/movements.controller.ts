import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateMovementDto } from './dto/create-movement.dto';
import { GetMovementsQueryDto } from './dto/get-movements-query.dto';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.movementsService.create(dto);
  }

  @Get()
  findAll(@Query() query: GetMovementsQueryDto) {
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }
}
