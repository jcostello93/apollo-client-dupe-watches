import { ApolloLink, Observable } from '@apollo/client';
import { graphql, print } from 'graphql';
import { schema } from './schema';

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export const executableLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const { query, operationName, variables } = operation;
    let active = true;

    const run = async () => {
      try {
        await delay(50);
        if (!active) return;
        const result = await graphql({
          schema,
          source: print(query),
          variableValues: variables,
          operationName,
        });
        if (!active) return;
        observer.next(result as any);
        observer.complete();
      } catch (err) {
        if (!active) return;
        observer.error(err);
      }
    };

    run();

    return () => {
      active = false;
    };
  });
});
