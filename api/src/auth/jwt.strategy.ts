import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(@InjectRepository(User) private readonly repo:Repository<User>){
super({
    ignoreExpiration:false,
    secretOrKey:"kmbsecretkey",
    jwtFromRequest:ExtractJwt.fromExtractors([(request:Request)=>{
        return request?.cookies?.Authentication;
    }])
});
    }
    async validate(Payload:any,req:Request){
        if(!Payload){
            throw new UnauthorizedException();
        }
        const user= await this.repo.findOne( {where:{email:Payload.email} } );
        if(!user){
            throw new UnauthorizedException();
        }
        req.user=user;
        return req.user;
    }
}
