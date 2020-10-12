import * as bcrypt from 'bcrypt';
import {Exclude} from 'class-transformer';
import {addModelToTypegoose, buildSchema, mongoose, pre, prop} from '@typegoose/typegoose';
import {verify} from 'jsonwebtoken';

@pre<User>('save', async function(): Promise<void> {
    await this.hashPassword();
})
export class User {

    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: User, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    public static compareToken(user: User, token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const decoded = verify(token, 'weather-server');
            resolve(decoded === user.id);
        });
    }

    @prop()
    public id: string;

    @prop()
    public firstName: string;

    @prop()
    public lastName: string;

    @prop()
    public email: string;

    @prop()
    @Exclude()
    public password: string;

    @prop()
    public username: string;

    @prop()
    public token: string;

    public toString(): string {
        return `${this.firstName} ${this.lastName} (${this.email})`;
    }

    public async hashPassword(): Promise<void> {
        this.password = await User.hashPassword(this.password);
    }
}
const userSquema = buildSchema(User);
addModelToTypegoose(mongoose.model('User', userSquema), User);
