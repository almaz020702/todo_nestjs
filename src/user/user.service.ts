import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class UserService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async registration(userData: CreateUserDto, res: Response) {
		const candidate = await this.prismaService.user.findUnique({
			where: { email: userData.email },
		});
		if (candidate) {
			throw new HttpException(
				"User with this email already exists",
				HttpStatus.BAD_REQUEST,
			);
		}
		const hashedPassword = await bcrypt.hash(userData.password, 5);
		const user = await this.prismaService.user.create({
			data: {
				email: userData.email,
				password: hashedPassword,
			},
		});
		const token = this.jwtService.sign({
			id: user.id,
			email: user.email,
		});
		res.cookie("accessToken", token, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
		});
		return {
			message: "User registration successful",
			user: {
				id: user.id,
				email: user.email,
			},
			accessToken: token,
		};
	}

	async login(userData: CreateUserDto, res: Response) {
		const candidate = await this.prismaService.user.findUnique({
			where: { email: userData.email },
		});
		if (!candidate) {
			throw new HttpException(
				"User with this email does not exist",
				HttpStatus.BAD_REQUEST,
			);
		}
		const comparePassword = bcrypt.compareSync(
			userData.password,
			candidate.password,
		);
		if (!comparePassword) {
			throw new HttpException(
				"Password is incorrect",
				HttpStatus.BAD_REQUEST,
			);
		}
		const token = this.jwtService.sign({
			id: candidate.id,
			email: candidate.email,
		});
		res.cookie("accessToken", token, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
		});
		return {
			message: "User login is successful",
			user: {
				id: candidate.id,
				email: candidate.email,
			},
			accessToken: token,
		};
	}

	async logout(res: Response){
		res.clearCookie('accessToken')
		return {
			message: "User logout is succesfull"
		};
	}
}
