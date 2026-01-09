import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DateScalar } from './scalars/date.scalar';
import { JSONScalar } from './scalars/json.scalar';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
    }),
  ],
  providers: [DateScalar, JSONScalar],
  exports: [DateScalar, JSONScalar],
})
export class GraphqlConfigModule {}
