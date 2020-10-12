import {addModelToTypegoose, buildSchema, mongoose, prop, Ref} from '@typegoose/typegoose';
import {User} from './User';
import {City} from './City';

export class Subscription {
    @prop({ref: () => User, type: mongoose.Schema.Types.ObjectId})
    public user: Ref<User>;

    @prop({ref: () => City, type: mongoose.Schema.Types.ObjectId})
    public city: Ref<City>;
}
const subscriptionSquema = buildSchema(Subscription);
addModelToTypegoose(mongoose.model('Subscription', subscriptionSquema), Subscription);
