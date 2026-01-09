import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'LEAP PM API - Learning Management System with Social Features';
  }
}
