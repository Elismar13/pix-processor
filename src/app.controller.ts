import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Job } from 'bull';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('jobs')
  async addJob(@Body() data: { message: string }) {
    const { jobId } = await this.appService.addJob(data);
    return { jobId, status: 'added' };
  }

  @Get('jobs/:id')
  async getJobStatus(@Param('id') id: string) {
    const { status } = await this.appService.getJobStatus(id);
    return { id, status };
  }
}
