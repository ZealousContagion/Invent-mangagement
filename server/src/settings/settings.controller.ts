import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Post()
  updateMany(@Body() body: { settings: { key: string; value: string }[] }) {
    return this.settingsService.updateMany(body.settings);
  }
}