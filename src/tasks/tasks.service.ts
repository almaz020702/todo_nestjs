import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Task } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
	constructor(private readonly prismaService: PrismaService) {}

	async getAllTasksByUserId(userId: number): Promise<Task[]> {
		const tasks = await this.prismaService.task.findMany({
			where: { userId },
		});
		return tasks;
	}

	async createTask(userId: number, taskDto: CreateTaskDto): Promise<void> {
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}

		await this.prismaService.task.create({
			data: {
				...taskDto,
				userId,
			},
		});
	}

	async getTaskById(taskId: number, userId: number): Promise<Task> {
		const task = await this.prismaService.task.findUnique({
			where: { id: taskId, userId },
		});
		if (!task) {
			throw new NotFoundException(`Task with ID ${taskId} not found`);
		}
		return task;
	}

	async updateTask(
		taskId: number,
		userId: number,
		updatedTaskData: UpdateTaskDto,
	): Promise<void> {
		const taskToUpdate = await this.prismaService.task.findUnique({
			where: { id: taskId, userId },
		});
		if (!taskToUpdate) {
			throw new NotFoundException(`Task with ID ${taskId} not found`);
		}

		await this.prismaService.task.update({
			where: { id: taskId },
			data: {
				...updatedTaskData,
			},
		});
	}

	async deleteTask(taskId: number, userId: number) {
		const taskToDelete = await this.prismaService.task.findUnique({
			where: {
				id: taskId,
				userId,
			},
		});

		if (!taskToDelete) {
			throw new NotFoundException(`Task with ID ${taskId} not found`);
		}

		await this.prismaService.task.delete({
			where: {
				id: taskId,
				userId,
			},
		});

		return { message: "A task was succesfully deleted" };
	}
}
