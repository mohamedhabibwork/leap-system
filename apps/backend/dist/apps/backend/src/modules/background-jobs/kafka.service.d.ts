import { OnModuleInit } from '@nestjs/common';
export declare class KafkaService implements OnModuleInit {
    private readonly logger;
    onModuleInit(): Promise<void>;
    publishEvent(topic: string, event: any): Promise<boolean>;
    publishAuditLog(action: string, userId: number, metadata: any): Promise<boolean>;
    publishCourseEvent(eventType: string, courseId: number, data: any): Promise<boolean>;
    publishSocialEvent(eventType: string, entityType: string, entityId: number, data: any): Promise<boolean>;
}
//# sourceMappingURL=kafka.service.d.ts.map