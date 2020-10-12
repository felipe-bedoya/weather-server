import {Body, JsonController, Post, Req, Res} from 'routing-controllers';
import {ResponseSchema} from 'routing-controllers-openapi';
import {UserResponse} from './UserController';
import {IsEmail, IsNotEmpty, IsUUID} from 'class-validator';
import {AuthService} from '../../auth/AuthService';
import {UserService} from '../services/UserService';

class BaseAuth {
    @IsNotEmpty()
    public username: string;
}

export class LoginUser extends BaseAuth {
    @IsNotEmpty()
    public password: string;
}

export class ResponseAuth extends BaseAuth {
    @IsUUID()
    public id: string;

    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsEmail()
    @IsNotEmpty()
    public email: string;
}

@JsonController('/auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {
    }

    @Post('/login')
    @ResponseSchema(UserResponse)
    public async login(@Req() req: any, @Res() res: any, @Body() body: LoginUser): Promise<UserResponse> {
        const currentUser = await this.authService.validateUser(body.username, body.password);
        currentUser.token = this.authService.generateToken(currentUser);
        req.header.authorization = 'Bearer ' + currentUser.token;
        res.header.authorization = 'Bearer ' + currentUser.token;
        const updated = await this.userService.update(currentUser.id, currentUser);
        return UserService.parseUser(updated);
    }

}
