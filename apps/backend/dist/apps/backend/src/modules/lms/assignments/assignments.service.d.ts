import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
export declare class AssignmentsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    gradeSubmission(submissionId: number, gradeDto: GradeSubmissionDto, instructorId: number): Promise<{
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
    getPendingSubmissions(instructorId: number, courseId?: number): Promise<{
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
    getSubmissionDetails(submissionId: number, instructorId: number): Promise<{
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
//# sourceMappingURL=assignments.service.d.ts.map