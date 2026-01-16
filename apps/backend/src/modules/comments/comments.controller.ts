import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('comments')
@Controller('comments')

@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @Get('by-commentable')
  findByCommentable(@Query('type') type: string, @Query('id', ParseIntPipe) id: number) {
    return this.commentsService.findByCommentable(type, id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }
}
