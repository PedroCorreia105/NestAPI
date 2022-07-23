import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2000':
      case 'P2002':
      case 'P2003':
      case 'P2004':
      case 'P2006':
      case 'P2011':
      case 'P2025':
        const status = HttpStatus.CONFLICT;
        const message: string = exception.message.replace(/\n/g, '');
        response.status(status).json({
          statusCode: status,
          message: message,
        });
        break;
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
