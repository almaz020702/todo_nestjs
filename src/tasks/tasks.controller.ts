import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Req,
	UseGuards,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { Payload } from "src/user/payload.interface";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Controller("tasks")
export class TasksController {
	constructor(
		private readonly tasksService: TasksService,
		private readonly jwtService: JwtService,
	) {}

	@Get("/")
	@UseGuards(JwtAuthGuard)
	async getAllTasks(@Req() req: Request) {
		const userId = req.user.id;
		if (!userId) {
			return "User ID not found in cookies.";
		}
		return this.tasksService.getAllTasksByUserId(userId);
	}

	@Post("/createTask")
	@UseGuards(JwtAuthGuard)
	async createTask(@Req() req: Request, @Body() taskDto: CreateTaskDto) {
		const userId = req.user.id;
		console.log(userId);
		if (!userId) {
			return "User ID not found in cookies.";
		}
		return this.tasksService.createTask(userId, taskDto);
	}

	@Get("/:taskId")
	@UseGuards(JwtAuthGuard)
	async getTaskById(@Req() req: Request) {
		const taskId = parseInt(req.params.taskId, 10);
		const userId = req.user.id;
		return this.tasksService.getTaskById(taskId, userId);
	}

	@Put("/:taskId")
	@UseGuards(JwtAuthGuard)
	async updateTask(@Req() req: Request, @Body() updatedData: UpdateTaskDto) {
		const userId = req.user.id;
		const taskId = parseInt(req.params.taskId);
		return this.tasksService.updateTask(taskId, userId, updatedData);
	}

	@Delete("/:taskId")
	@UseGuards(JwtAuthGuard)
	async deleteTask(@Req() req: Request) {
		const userId = req.user.id;
		const taskId = parseInt(req.params.taskId);
		return this.tasksService.deleteTask(taskId, userId);
	}
}
