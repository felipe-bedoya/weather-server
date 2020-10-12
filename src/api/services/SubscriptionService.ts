import {Service} from 'typedi';
import {getModelForClass} from '@typegoose/typegoose';
import {Subscription} from '../models/Subscription';
import {City} from '../models/City';
import {User} from '../models/User';
import {UserService} from './UserService';
import {CityService} from './CityService';

@Service()
export class SubscriptionService {

    public static parseSubscription(value: any): Subscription {
        const subscription = new Subscription();
        subscription.user = UserService.parseUser(value.user);
        subscription.city = CityService.parseCity(value.city);
        return subscription;
    }

    private subscriptionRepo = getModelForClass(Subscription);
    private userRepo = getModelForClass(User);
    private cityRepo = getModelForClass(City);

    public async create(user: string, city: string): Promise<Subscription> {
        const sub = new Subscription();
        sub.user = await this.userRepo.findOne({id: user});
        sub.city = await this.cityRepo.findOne({id: city});
        return new Promise(async resolve => {
            const dbSub = await this.subscriptionRepo.create(sub);
            resolve(SubscriptionService.parseSubscription(dbSub));
        });
    }

    public async remove(user: string, city: string): Promise<void> {
        console.log(user);
        console.log(city);
        const dbUser = await this.userRepo.findOne({id: user});
        const dbCity = await this.cityRepo.findOne({id: city});
        await this.subscriptionRepo.findOneAndDelete({user: dbUser._id, city: dbCity._id});
        return;
    }
}
