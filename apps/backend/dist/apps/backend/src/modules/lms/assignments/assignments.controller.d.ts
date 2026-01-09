import { AssignmentsService } from './assignments.service';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    gradeSubmission(id: number, gradeDto: GradeSubmissionDto, req: any): Promise<{
        id: number;
        uuid: string;
        assignmentId: number;
        userId: number;
        submissionText: string;
        fileUrl: string;
        statusId: number;
        score: string;
        maxPoints: string;
        feedback: string;
        submittedAt: Date;
        gradedAt: Date;
        gradedBy: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    getPendingSubmissions(req: any, courseId?: string): Promise<{
        id: number;
        uuid: string;
        assignmentId: number;
        assignmentTitle: string;
        userId: number;
        userName: string;
        userEmail: string;
        submissionText: string;
        fileUrl: string;
        submittedAt: Date;
        courseId: number;
        courseName: string;
    }[]>;
    getSubmissionDetails(id: number, req: any): Promise<{
        id: number;
        uuid: string;
        assignmentId: number;
        assignmentTitle: string;
        assignmentDescription: string;
        assignmentInstructions: string;
        maxPoints: number;
        userId: number;
        userName: string;
        userEmail: string;
        submissionText: string;
        fileUrl: string;
        statusId: number;
        score: string;
        submittedMaxPoints: string;
        feedback: string;
        submittedAt: Date;
        gradedAt: Date;
        gradedBy: number;
        courseId: number;
        courseName: string;
        instructorId: number;
    }>;
}
//# sourceMappingURL=assignments.controller.d.ts.map