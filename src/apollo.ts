import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { executableLink } from './executableLink';

const cache = new InMemoryCache({
  typePolicies: {
    Item: { keyFields: ['id'] },
    Parent: { keyFields: ['id'] },
  },
});

const link = ApolloLink.from([
  executableLink,
]);

export const client = new ApolloClient({
  cache,
  link,
});


export function getWatchCount(): number {
  const cacheWithWatches = client.cache as any;
  return cacheWithWatches?.watches?.size ?? 0;
}
