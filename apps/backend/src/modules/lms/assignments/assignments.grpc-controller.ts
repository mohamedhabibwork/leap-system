import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssignmentsService } from './assignments.service';

@Controller()
export class AssignmentsGrpcController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @GrpcMethod('AssignmentsService', 'FindAll')
  async findAll() {
    const assignments = await this.assignmentsService.findAll();
    return { assignments };
  }

  @GrpcMethod('AssignmentsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.assignmentsService.findOne(data.id);
  }

  @GrpcMethod('AssignmentsService', 'FindBySection')
  async findBySection(data: { sectionId: number }) {
    const assignments = await this.assignmentsService.findBySection(data.sectionId);
    return { assignments };
  }

  @GrpcMethod('AssignmentsService', 'Create')
  async create(data: any) {
    return this.assignmentsService.create(data);
  }

  @GrpcMethod('AssignmentsService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.assignmentsService.update(id, updateData);
  }

  @GrpcMethod('AssignmentsService', 'Delete')
  async delete(data: { id: number }) {
    await this.assignmentsService.remove(data.id);
    return { message: 'Assignment deleted successfully' };
  }
}
