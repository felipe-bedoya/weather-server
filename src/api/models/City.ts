import {addModelToTypegoose, buildSchema, mongoose, prop} from '@typegoose/typegoose';

export class City {
    @prop()
    public id: string;

    @prop({index: true, text: true})
    public name: string;

    @prop()
    public state: string;

    @prop()
    public country: string;
}
const citySquema = buildSchema(City);
addModelToTypegoose(mongoose.model('City', citySquema), City);
