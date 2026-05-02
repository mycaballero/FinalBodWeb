import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string; details?: unknown };
      const message = typeof payload === 'string' ? payload : payload.message;

      response.status(status).json({
        code: status,
        message,
        details: typeof payload === 'string' ? null : payload,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
