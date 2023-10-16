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
import { User } from "src/user/user.decorator";

@Controller("tasks")
export class TasksController {
	constructor(
		private readonly tasksService: TasksService,
		private readonly jwtService: JwtService,
	) {}

	@Get("/")
	@UseGuards(JwtAuthGuard)
	async getAllTasks(@User() user: Payload) {
		return this.tasksService.getAllTasksByUserId(user.id);
	}

	@Post("/createTask")
	@UseGuards(JwtAuthGuard)
	async createTask(@User() user: Payload, @Body() taskDto: CreateTaskDto) {
		return this.tasksService.createTask(user.id, taskDto);
	}

	@Get("/:taskId")
	@UseGuards(JwtAuthGuard)
	async getTaskById(@Req() req: Request, @User() user: Payload) {
		const taskId = parseInt(req.params.taskId, 10);
		return this.tasksService.getTaskById(taskId, user.id);
	}

	@Put("/:taskId")
	@UseGuards(JwtAuthGuard)
	async updateTask(@Req() req: Request, @Body() updatedData: UpdateTaskDto, @User() user: Payload) {
		const taskId = parseInt(req.params.taskId);
		return this.tasksService.updateTask(taskId, user.id, updatedData);
	}

	@Delete("/:taskId")
	@UseGuards(JwtAuthGuard)
	async deleteTask(@Req() req: Request, @User() user: Payload) {
		const taskId = parseInt(req.params.taskId);
		return this.tasksService.deleteTask(taskId, user.id);
	}
}
