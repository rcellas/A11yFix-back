import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({
    status: 200,
    description: 'Service is operational and healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-09-02T22:00:00.000Z' },
        version: { type: 'string', example: '0.1.0' },
        uptime: { type: 'number', example: 12.34 },
      },
    },
  })
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      uptime: process.uptime(),
    };
  }
}
