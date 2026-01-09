import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GrpcAuthInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = context.getArgByIndex(1);
    const authorization = metadata?.get('authorization')?.[0];

    if (!authorization) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);
      context.switchToHttp().getRequest().user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return next.handle();
  }
}
