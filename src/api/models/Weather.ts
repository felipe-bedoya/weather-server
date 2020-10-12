import {addModelToTypegoose, buildSchema, mongoose, prop, Ref} from '@typegoose/typegoose';
import {City} from './City';
import moment = require('moment');

export class Weather {

    @prop()
    public temperature: number;

    @prop()
    public humidity: number;

    @prop()
    public type: number;

    @prop()
    public description: string;

    @prop()
    public icon: string;

    @prop({ref: () => City, type: mongoose.Schema.Types.ObjectId, autopopulate: true})
    public city: Ref<City>;

    @prop()
    public lastUpdate: moment.Moment;

    @prop()
    public title: string;
}

const weatherSquema = buildSchema(Weather);
addModelToTypegoose(mongoose.model('Weather', weatherSquema), Weather);
