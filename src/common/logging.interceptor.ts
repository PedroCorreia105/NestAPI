import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const host = context.switchToHttp();
    const req = host.getRequest();
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap({
        next: () =>
          Logger.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name),
        error: (error) =>
          Logger.log(
            `${method} ${url} ${Date.now() - now}ms ${JSON.stringify(error)}`,
            context.getClass().name,
          ),
      }),
    );
  }
}
