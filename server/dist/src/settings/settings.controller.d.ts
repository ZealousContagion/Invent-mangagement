import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<any>;
    updateMany(body: {
        settings: {
            key: string;
            value: string;
        }[];
    }): Promise<any>;
}
