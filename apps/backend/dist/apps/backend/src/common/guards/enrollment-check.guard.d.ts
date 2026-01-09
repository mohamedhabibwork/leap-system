import { CanActivate, ExecutionContext } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class EnrollmentCheckGuard implements CanActivate {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=enrollment-check.guard.d.ts.map