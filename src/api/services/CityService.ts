import {Service} from 'typedi';
import {getModelForClass} from '@typegoose/typegoose';
import {City} from '../models/City';

@Service()
export class CityService {
    public static parseCity(value: any): City {
        const c = new City();
        c.id = value.id;
        c.name = value.name;
        c.country = value.country;
        c.state = value.state;
        return c;
    }
    private numberOfCities = 100;

    private cityRepository = getModelForClass(City);

    public async find(page?: number): Promise<City[]> {
        if (page === undefined) {
            page = 0;
        }
        return (await this.cityRepository.find().skip(page * this.numberOfCities).limit(this.numberOfCities).exec()).map(CityService.parseCity);
    }

    public async search(text: string): Promise<City[]> {
        return (await this.cityRepository.find({$text: {$search: '/' + text + '/'}}).populate().exec()).map(CityService.parseCity);
    }

    public findOne(id: string): Promise<City | undefined> {
        return this.cityRepository.findOne({id}).map(CityService.parseCity);
    }

    public async create(city: City): Promise<City> {
        return await this.cityRepository.save(city);
    }

    public async update(id: string, city: City): Promise<City> {
        city.id = id;
        return this.cityRepository.findOneAndUpdate(id, city);
    }

    public async delete(id: string): Promise<void> {
        await this.cityRepository.findOneAndDelete(id);
        return;
    }
}
