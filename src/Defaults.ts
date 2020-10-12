import {City} from './api/models/City';

import * as fs from 'fs';
import {getModelForClass} from '@typegoose/typegoose';
import {User} from './api/models/User';
import uuid from 'uuid';

export async function setDefaults(): Promise<any> {
    const userRepo = getModelForClass(User);
    if (await userRepo.find().countDocuments() === 0) {
        const usr = new User();
        usr.id = uuid.v1();
        usr.username = 'admin';
        usr.password = '1234';
        usr.firstName = 'Felipe';
        usr.lastName = 'Bedoya';
        usr.email = 'luisfbedoyam@gmail.com';
        await userRepo.create(usr as User);
    }

    const repo = getModelForClass(City);
    if (await repo.find().countDocuments() === 0) {
        const buffer = fs.readFileSync('city.list.json');
        const data = JSON.parse(buffer.toString());
        for (const value of data) {
            const city = new City();
            city.id = value.id;
            city.name = value.name;
            city.state = value.state;
            city.country = value.country;
            await repo.create(city as City);
        }
        console.log('Finished creating');
    }
}
