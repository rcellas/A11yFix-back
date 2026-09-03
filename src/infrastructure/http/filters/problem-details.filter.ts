import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainError,
  EntityNotFoundError,
  InvalidStateTransitionError,
  InvalidUrlError,
} from '../../../domain/errors/domain.error';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const instance = request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred processing your request.';
    let type = 'https://httpstatuses.com/500';

    if (
      exception instanceof EntityNotFoundError ||
      (exception as Error)?.name === 'EntityNotFoundError'
    ) {
      status = HttpStatus.NOT_FOUND;
      title = 'Resource Not Found';
      detail = (exception as Error).message;
      type = 'https://httpstatuses.com/404';
    } else if (
      exception instanceof InvalidUrlError ||
      exception instanceof InvalidStateTransitionError ||
      exception instanceof DomainError ||
      (exception as Error)?.name === 'InvalidUrlError' ||
      (exception as Error)?.name === 'InvalidStateTransitionError' ||
      (exception as Error)?.name === 'DomainError'
    ) {
      status = HttpStatus.BAD_REQUEST;
      title = 'Bad Request';
      detail = (exception as Error).message;
      type = 'https://httpstatuses.com/400';
    } else if (
      exception instanceof HttpException ||
      typeof (exception as Record<string, unknown>)?.getStatus === 'function'
    ) {
      const httpEx = exception as HttpException;
      status = httpEx.getStatus();
      const res = httpEx.getResponse();
      title = httpEx.name;
      detail = typeof res === 'string' ? res : (res as { message?: string }).message || httpEx.message;
      type = `https://httpstatuses.com/${status}`;
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      detail = exception.message;
    }

    const problem: ProblemDetails = {
      type,
      title,
      status,
      detail,
      instance,
    };

    response.status(status).contentType('application/problem+json').json(problem);
  }
}
