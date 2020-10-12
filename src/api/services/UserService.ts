import {Service} from 'typedi';
import {User} from '../models/User';
import {getModelForClass} from '@typegoose/typegoose';
import uuid from 'uuid';

@Service()
export class UserService {

    public static parseUser(value: any): User | undefined {
        const user = new User();
        user.id = value.id;
        user.username = value.username;
        user.firstName = value.firstName;
        user.lastName = value.lastName;
        user.email = value.email;
        user.token = value.token;
        return user;
    }
    private userRepository = getModelForClass(User);

    public async find(): Promise<User[]> {
        return (await this.userRepository.find().exec()).map(UserService.parseUser);
    }

    public findOne(id: string): Promise<User> {
        return new Promise<User>(resolve => {
            resolve(UserService.parseUser(this.userRepository.findOne({id})));
        });
    }

    public async create(user: User): Promise<User> {
        user.id = uuid.v1();
        return this.userRepository.save(user);
    }

    public async update(id: string, user: User): Promise<User> {
        user.id = id;
        await this.userRepository.findOneAndUpdate(id, user);
        const dbUser = await this.userRepository.findOne({id}).exec();
        console.log(dbUser);
        return dbUser;
    }

    public async delete(id: string): Promise<void> {
        await this.userRepository.findOneAndDelete(id);
        return;
    }

}
