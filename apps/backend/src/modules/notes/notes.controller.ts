import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notes')
@Controller('notes')

@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(user.userId, createNoteDto);
  }

  @Get('my-notes')
  getMyNotes(@CurrentUser() user: any) {
    return this.notesService.findByUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notesService.remove(id);
  }
}
