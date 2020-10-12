import {IsNotEmpty} from 'class-validator';
import {Authorized, Get, JsonController, Param} from 'routing-controllers';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {CityService} from '../services/CityService';

class BaseCity {
    @IsNotEmpty()
    public id: string;

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public state: string;

    @IsNotEmpty()
    public country: string;
}

export class CityResponse extends BaseCity {
}

@Authorized()
@JsonController('/cities')
@OpenAPI({security: [{basicAuth: []}]})
export class CityController {

    constructor(
        private cityService: CityService
    ) {
    }

    @Get('/:page')
    public fetch(@Param('page') page: number): Promise<BaseCity[]> {
        if (page === undefined) {
            page = 0;
        }
        return this.cityService.find(page);
    }

    @Get('/search/:query')
    @ResponseSchema(CityResponse, {isArray: true})
    public async search(@Param('query') query: string): Promise<BaseCity[]> {
        return await this.cityService.search(query);
    }

}
