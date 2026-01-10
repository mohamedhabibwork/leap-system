import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // Check if this is a GraphQL context
    try {
      const ctx = GqlExecutionContext.create(context);
      const gqlContext = ctx.getContext();
      if (gqlContext && gqlContext.req) {
        return gqlContext.req.user;
      }
    } catch {
      // Not a GraphQL context, fall through to REST
    }

    // For REST controllers, get user from HTTP request
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
