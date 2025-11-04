export type Item = {
  __typename: 'Item';
  id: string;
  name: string;
};

export type AppItemsQueryData = {
  items: Item[];
};

export type AppItemsQueryVars = {
  count: number;
  parentId: string;
};
