import { Body, Controller, Post, Res } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { Response } from "express";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/registration")
  async registration(@Res({ passthrough: true }) res: Response, @Body() dto: CreateUserDto) {
    return this.userService.registration(dto, res);
  }

  @Post("/login")
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: CreateUserDto) {
    return this.userService.login(dto, res);
  }

  @Post("/logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.userService.logout(res);
  }
}
