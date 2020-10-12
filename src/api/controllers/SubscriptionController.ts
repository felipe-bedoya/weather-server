import {Authorized, Body, JsonController, Post} from 'routing-controllers';
import {OpenAPI, ResponseSchema} from 'routing-controllers-openapi';
import {SubscriptionService} from '../services/SubscriptionService';
import {IsNotEmpty} from 'class-validator';
import {UserResponse} from './UserController';
import {CityResponse} from './CityController';
import {Subscription} from '../models/Subscription';
import {WeatherService} from '../services/WeatherService';

class BaseSubscription {
    @IsNotEmpty()
    public id: string;
}

export class SubscriptionResponse extends BaseSubscription {
    @IsNotEmpty()
    public user: UserResponse;

    @IsNotEmpty()
    public city: CityResponse;
}

export class CreateSubscriptionBody {
    @IsNotEmpty()
    public user: string;

    @IsNotEmpty()
    public city: string;
}

@Authorized()
@JsonController('/subscription')
@OpenAPI({security: [{basicAuth: []}]})
export class SubscriptionControllerController {

    constructor(
        private subscriptionService: SubscriptionService,
        private weatherService: WeatherService
    ) {
    }

    @Post()
    @ResponseSchema(SubscriptionResponse)
    public async create(@Body() body: CreateSubscriptionBody): Promise<Subscription> {
        const sub = await this.subscriptionService.create(body.user, body.city);
        await this.weatherService.create(sub);
        return sub;
    }

    @Post('/delete')
    public async remove(@Body() body: CreateSubscriptionBody): Promise<CreateSubscriptionBody> {
        await this.weatherService.delete(body.user, body.city);
        return body;
    }

}
