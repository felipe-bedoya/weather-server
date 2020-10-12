import {Service} from 'typedi';
import {getModelForClass} from '@typegoose/typegoose';
import {Weather} from '../models/Weather';
import {User} from '../models/User';
import {Subscription} from '../models/Subscription';

import * as http from 'http';
import {env} from '../../env';
import {City} from '../models/City';
import moment = require('moment');
import {CityService} from './CityService';

@Service()
export class WeatherService {
    public static parseWeather(value: any): Weather {
        const weather = new Weather();
        weather.temperature = value.temperature;
        weather.humidity = value.humidity;
        weather.icon = value.icon;
        weather.type = value.type;
        weather.description = value.description;
        weather.city = CityService.parseCity(value.city);
        weather.lastUpdate = value.lastUpdate;
        return weather;
    }

    private cityRepo = getModelForClass(City);
    private userRepo = getModelForClass(User);
    private subscriptionRepo = getModelForClass(Subscription);
    private weatherRepo = getModelForClass(Weather);

    public async find(user: User): Promise<Weather[]> {
        const dbUser = await this.userRepo.findOne({id: user.id}).exec();
        const dbSubs = await this.subscriptionRepo.find({user: dbUser._id}).exec();
        if (dbSubs.length === 0) {
            return [];
        }
        const cities = dbSubs.map((value) => {
            return value.city._id;
        });
        const weathers = await this.weatherRepo.find({city: cities}).exec();
        const parsedResult = [];
        for (const w of weathers) {
            w.city = await this.cityRepo.findById(w.city).exec();
            parsedResult.push(WeatherService.parseWeather(w));
        }
        return parsedResult;
    }

    public async create(subscription: Subscription): Promise<Weather> {
        const url = `http://api.openweathermap.org/data/2.5/weather?id=${subscription.city.id}&units=metric&appid=${env.weather.apikey}`;
        return await new Promise<Weather>(resolve => {
            console.log('creating request');
            http.request(url, (req) => {
                console.log('creating on event');
                req.on('data', async (buffer) => {
                    const dbCity = await this.cityRepo.findOne({id: subscription.city.id}).exec();
                    const data = JSON.parse(buffer);
                    const weather = new Weather();
                    weather.temperature = data.main.temp;
                    weather.type = data.weather[0].id;
                    weather.icon = data.weather[0].icon;
                    weather.humidity = data.main.humidity;
                    weather.title = data.weather[0].main;
                    weather.description = data.weather[0].description;
                    weather.city = dbCity;
                    weather.lastUpdate = moment();
                    await this.weatherRepo.create(weather);
                    resolve(weather);
                });
            }).end();
        });
    }

    public async update(user: User): Promise<Weather[]> {
        const dbUser = await this.userRepo.findOne({id: user.id}).exec();
        const dbSubs = await this.subscriptionRepo.find({user: dbUser._id}).exec();
        if (dbSubs.length === 0) {
            return [];
        }
        const cities = await this.cityRepo.find({
            _id: dbSubs.map((value) => {
                return value.city;
            }),
        });
        const dbWeathers = (await this.weatherRepo.find({
            city: cities,
        }).exec()).filter(value => {
            return moment().diff(moment(value.lastUpdate), 'minutes') >= 1;
        });
        let citiesToFetch = dbWeathers.map((w) => {
            const city = cities.find(value => {
                return value._id.toString() === w.city.toString();
            });
            if (city === undefined) {
                return '';
            }
            return city.id;
        });
        if (citiesToFetch.length === 0) {
            return [];
        }
        citiesToFetch = citiesToFetch.reduce((previousValue, currentValue) => {
            if (currentValue === undefined) {
                return previousValue;
            } else {
                return previousValue + ',' + currentValue;
            }
        }).split(',');
        const url = `http://api.openweathermap.org/data/2.5/group?id=${citiesToFetch.join(',')}&units=metric&appid=${env.weather.apikey}`;
        console.log(url);
        return await new Promise((resolve, reject) => {
            console.log('setting request');
            http.request(url, (req) => {
                let resBody = '';
                req.on('data',  (buffer) => {
                    resBody += buffer;
                });
                req.on('end', async () => {
                    console.log(resBody.toString());
                    try {
                        const data = JSON.parse(resBody.toString());
                        const dbCities = await this.cityRepo.find({id: citiesToFetch}).exec();
                        const weathers = data.list.map(async (value) => {
                            const dbCity = dbCities.find((city) => {
                                return city.id.toString() === value.id.toString();
                            });
                            const dbWeather = await this.weatherRepo.findOne({city: dbCity._id}).exec();
                            dbWeather.temperature = value.main.temp;
                            dbWeather.type = value.weather[0].id;
                            dbWeather.icon = value.weather[0].icon;
                            dbWeather.humidity = value.main.humidity;
                            dbWeather.description = value.weather[0].description;
                            dbWeather.city = dbCity;
                            dbWeather.lastUpdate = moment();
                            return WeatherService.parseWeather(await this.weatherRepo.findOneAndUpdate({_id: dbWeather._id}, dbWeather));
                        });
                        resolve(weathers);
                    } catch (err) {
                        console.log(err);
                        resolve([]);
                    }
                });
            }).end();
        });
    }

    public async delete(user: string, city: string): Promise<void> {
        const dbUser = await this.userRepo.findOne({id: user}).exec();
        const dbCity = await this.cityRepo.findOne({id: city}).exec();
        await this.subscriptionRepo.findOneAndDelete({user: dbUser._id, city: dbCity._id}).exec();
        console.log('Deleted Sub');
        const subs = await this.subscriptionRepo.find({city: dbCity._id}).exec();
        if (subs.length === 0) {
            console.log('No more subs');
            await this.weatherRepo.findOneAndDelete({city: dbCity._id}).exec();
        }
        return;
    }
}
