import { CoursesService } from './courses.service';
export declare class CoursesResolver {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    courses(): Promise<string>;
    course(id: number): Promise<string>;
    createCourse(input: string): Promise<string>;
}
//# sourceMappingURL=courses.resolver.d.ts.map