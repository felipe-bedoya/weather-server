import { IsEmail, IsNotEmpty} from 'class-validator';
import {
    Authorized, Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put, Req
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { UserNotFoundError } from '../errors/UserNotFoundError';
import { User } from '../models/User';
import { UserService } from '../services/UserService';

class BaseUser {
    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @IsNotEmpty()
    public username: string;
}

export class UserResponse extends BaseUser {
    @IsNotEmpty()
    public id: string;

    @IsNotEmpty()
    public token: string;
}

class CreateUserBody extends BaseUser {
    @IsNotEmpty()
    public password: string;
}

@Authorized()
@JsonController('/users')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get()
    @ResponseSchema(UserResponse, { isArray: true })
    public find(): Promise<User[]> {
        return this.userService.find();
    }

    @Get('/me')
    @ResponseSchema(UserResponse)
    public async findMe(@Req() req: any): Promise<User> {
        console.log(req.user);
        return UserService.parseUser(req.user);
    }

    @Get('/:id')
    @OnUndefined(UserNotFoundError)
    @ResponseSchema(UserResponse)
    public one(@Param('id') id: string): Promise<User | undefined> {
        return this.userService.findOne(id);
    }

    @Post()
    @ResponseSchema(UserResponse)
    public create(@Body() body: CreateUserBody): Promise<User> {
        const user = new User();
        user.email = body.email;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.password = body.password;
        user.username = body.username;

        return this.userService.create(user);
    }

    @Put('/:id')
    @ResponseSchema(UserResponse)
    public update(@Param('id') id: string, @Body() body: BaseUser): Promise<User> {
        const user = new User();
        user.email = body.email;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.username = body.username;

        return this.userService.update(id, user);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<void> {
        return this.userService.delete(id);
    }

}
