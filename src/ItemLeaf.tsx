import React from 'react';
import { useFragment } from '@apollo/client/react';
import { gql, TypedDocumentNode } from '@apollo/client';

export const ParentName_fragment: TypedDocumentNode<{ __typename: 'Parent'; id: string; name: string }, {}> = gql`
  fragment ParentName_fragment on Parent {
    __typename
    id
    name
  }
`;

type ItemLeafProps = {
  item: { __typename: 'Item'; id: string; name: string };
  parentRef: { __typename: 'Parent'; id: string };
};

export const ItemLeaf: React.FC<ItemLeafProps> = ({ item, parentRef }) => {
  const { data: parentData } = useFragment({ fragment: ParentName_fragment, from: parentRef });
  const pid = parentData?.id;
  const pname = parentData?.name;
  return (
    <div style={{ padding: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>
        {item.id}, {item.name}, {pid}, {pname}
      </span>
    </div>
  );
};

export const ItemLeafDup: React.FC<{ parentRef: { __typename: 'Parent'; id: string } }> = ({ parentRef }) => {
  const { data: parentData } = useFragment({ fragment: ParentName_fragment, from: parentRef });
  if (!parent) return null;
  return <span style={{ display: 'none' }}>{parentData.id}</span>;
};
