import * as express from 'express';
import {Service} from 'typedi';

import {User} from '../api/models/User';
import {Logger, LoggerInterface} from '../decorators/Logger';
import {getModelForClass} from '@typegoose/typegoose';
import {UserService} from '../api/services/UserService';
import {sign} from 'jsonwebtoken';

@Service()
export class AuthService {
    private userRepository = getModelForClass(User);

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) {
    }

    public parseBasicAuthFromRequest(req: express.Request): { username: string, password: string } {
        const authorization = req.header('authorization');
        this.log.info(authorization);
        if (authorization && authorization.split(' ')[0] === 'Basic') {
            this.log.info('Credentials provided by the client');
            const decodedBase64 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            const username = decodedBase64.split(':')[0];
            const password = decodedBase64.split(':')[1];
            if (username && password) {
                return {username, password};
            }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public parseBearerAuthFromRequest(req: express.Request): string | undefined {
        const authorization = req.header('authorization');
        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            this.log.info('Credentials provided by the client');
            return authorization.split(' ')[1];
        }
        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async validateUser(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({username}).exec();
        if (await User.comparePassword(user, password)) {
            return UserService.parseUser(user);
        }

        return undefined;
    }

    public async validateToken(token: string): Promise<User> {
        const user = await this.userRepository.findOne({token}).exec();
        this.log.info(token);
        if (await User.compareToken(user, token)) {
            return user;
        }
        return undefined;
    }

    public generateToken(user: User): string {
        return sign(user.id, 'weather-server');
    }
}
