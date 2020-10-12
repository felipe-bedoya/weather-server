import {Authorized, Get, JsonController, Req} from 'routing-controllers';
import {OpenAPI} from 'routing-controllers-openapi';
import {WeatherService} from '../services/WeatherService';
import {Weather} from '../models/Weather';

@Authorized()
@JsonController('/weather')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class WeatherController {

    constructor(private weatherService: WeatherService) {
    }

    @Get()
    public async fetch(@Req() req: any): Promise<Weather[]> {
        await this.weatherService.update(req.user);
        return this.weatherService.find(req.user);
    }

    @Get('/update')
    public async update(@Req() req: any): Promise<Weather[]> {
        await this.weatherService.update(req.user);
        return this.weatherService.find(req.user);
    }
}
