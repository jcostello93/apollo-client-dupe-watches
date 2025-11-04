import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

const ItemType = new GraphQLObjectType({
  name: 'Item',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    parentId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

import { pickWord } from './words';

function makeItems(count: number, parentId: string) {
  const items = [] as Array<{ id: string; name: string; parentId: string }>;
  for (let i = 0; i < count; i++) {
    items.push({ id: i.toString(), name: pickWord(i), parentId });
  }
  return items;
}

const parents: Record<string, { id: string; name: string }> = {
  'parent-1': { id: 'parent-1', name: pickWord(1) },
};

const ParentType = new GraphQLObjectType({
  name: 'Parent',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ItemType))),
      args: {
        count: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent: { id: string }, { count }: { count: number }) => makeItems(count, parent.id),
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ItemType))),
      args: {
        count: { type: new GraphQLNonNull(GraphQLInt) },
        parentId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_src, { count, parentId }: { count: number; parentId: string }) => makeItems(count, parentId),
    },
    parent: {
      type: new GraphQLNonNull(ParentType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_src, { id }: { id: string }) => {
        return parents[id] ?? { id, name: 'Parent' };
      },
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType });
