import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from "@nestjs/common";
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
			throw new BadRequestException(
				"User with this email already exists",
			);
		}
		const hashedPassword = await bcrypt.hash(userData.password, 5);
		const user = await this.prismaService.user.create({
			data: {
				email: userData.email,
				password: hashedPassword,
			},
		});
		const token = this.generateAccessToken(user);
		this.setAccessTokenCookie(res, token);
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
			throw new BadRequestException(
				"User with this email does not exist",
			);
		}
		const isPasswordValid = await this.comparePasswords(
			userData.password,
			candidate.password,
		);
		if (!isPasswordValid) {
			throw new HttpException(
				"Password is incorrect",
				HttpStatus.BAD_REQUEST,
			);
		}
		const token = this.generateAccessToken(candidate);

		this.setAccessTokenCookie(res, token);

		return {
			message: "User login is successful",
			user: {
				id: candidate.id,
				email: candidate.email,
			},
			accessToken: token,
		};
	}

	private async comparePasswords(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}

	private generateAccessToken(user: any): string {
		return this.jwtService.sign({
			id: user.id,
			email: user.email,
		});
	}

	private setAccessTokenCookie(res: Response, token: string) {
		res.cookie("accessToken", token, {
			maxAge: 60 * 60 * 1000, // 1 hour
			httpOnly: true,
		});
	}

	async logout(res: Response) {
		res.clearCookie("accessToken");
		return {
			message: "User logout is succesfull",
		};
	}
}
