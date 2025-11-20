import React, { useMemo, useState } from 'react';
import { useQuery, useFragment } from '@apollo/client/react';
import { gql, TypedDocumentNode } from '@apollo/client';
import type { AppItemsQueryVars } from './types';


const ParentName_fragment: TypedDocumentNode<{ __typename: 'Parent'; id: string; name: string }, never> = gql`
  fragment ParentName_fragment on Parent { __typename id name }
`;

import { getWatchCount, client } from './apollo';
import { ItemLeaf, ItemLeafDup } from './ItemLeaf';
import { randomWord } from './words';

const PARENT_ID = 'parent-1';

const App_Query: TypedDocumentNode<
  { parent: { __typename: 'Parent'; id: string; name: string; items: { __typename: 'Item'; id: string; name: string }[] } },
  AppItemsQueryVars
> = gql`
  query App_Query($count: Int!, $parentId: ID!) {
    parent(id: $parentId) {
      ...ParentName_fragment
      items(count: $count) { __typename id name }
    }
  }
  ${ParentName_fragment}
`;

export const App: React.FC = () => {
  const [count, setCount] = useState<number>(5000);
  const [scenario, setScenario] = useState<'A' | 'B'>('A');
  const [duplication, setDuplication] = useState<number>(4);

  const { data } = useQuery(App_Query, {
    variables: { count, parentId: PARENT_ID },
  });

  const items = (data?.parent?.items ?? []) as { __typename: 'Item'; id: string; name: string }[];
  const parentName = data?.parent?.name ?? 'Parent';


  const [watchCount, setWatchCount] = React.useState(0);
  const [lastBW, setLastBW] = useState<number | null>(null);
  React.useEffect(() => {
    const id = setInterval(() => setWatchCount(getWatchCount()), 500);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    const cacheAny: any = client.cache as any;
    if (cacheAny && typeof cacheAny.broadcastWatches === 'function' && !cacheAny.__bwPatched) {
      const originalBroadcastWatches = cacheAny.broadcastWatches.bind(cacheAny);
      cacheAny.broadcastWatches = function(...args: unknown[]) {
        const startTime = performance.now();
        try {
          return originalBroadcastWatches(...args);
        } finally {
          const endTime = performance.now();
          const duration = endTime - startTime;
          setLastBW(duration);
          console.log(`broadcastWatches took ${duration.toFixed(2)}ms`);
        }
      };
      cacheAny.__bwPatched = true;
    }
  }, []);

  return (
    <div>
      <h1>Apollo watch duplication - fragment colocation vs context</h1>
      <div>Parent: {parentName} (id: {PARENT_ID})</div>
      <div>
        <label>
          Items:&nbsp;
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={100}
          />
        </label>
        <label>
          Scenario:&nbsp;
          <select value={scenario} onChange={(e) => setScenario(e.target.value as any)}>
            <option value="A">A: fragment colocation (leaf watches)</option>
            <option value="B">B: context/props (no leaf watches)</option>
          </select>
        </label>
        {scenario === 'A' && (
          <label>
            Duplication (1-100):&nbsp;
            <input
              type="number"
              min={1}
              max={100}
              value={duplication}
              onChange={(e) => {
                const v = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                setDuplication(v);
              }}
            />
          </label>
        )}
        <button onClick={() => {
          const storeId = client.cache.identify({ __typename: 'Parent', id: PARENT_ID });
          if (storeId) {
            client.cache.writeFragment({
              id: storeId,
              fragment: ParentName_fragment,
              data: {
                __typename: 'Parent',
                id: PARENT_ID,
                name: randomWord(),
              },
            });
          }
        }}>
          Update parent.name
        </button>
      </div>

      <StatsPanel watchCount={watchCount} lastBW={lastBW} />

      {scenario === 'A' ? (
        <ScenarioA items={items} duplication={duplication} />
      ) : (
        <ScenarioB items={items} parentName={parentName} />
      )}
    </div>
  );
};

const StatsPanel: React.FC<{ watchCount: number; lastBW: number | null }> = ({ watchCount, lastBW }) => {
  return (
    <div>
      <strong>Watch stats</strong>
      <div>Total active watches: {watchCount}</div>
      <div>Last broadcastWatches: {lastBW != null ? `${lastBW.toFixed(2)}ms` : '—'}</div>
    </div>
  );
};

const ScenarioA: React.FC<{ items: any[]; duplication: number }> = ({ items, duplication }) => {
  return (
    <div>
      <h3>Scenario A: Parent fragment in each leaf (no item fragment)</h3>
      <div>
        {items.map((item: any) => (
          <div key={item.id}>
            <ItemLeaf item={item} parentRef={{ __typename: 'Parent', id: PARENT_ID }} />
            {duplication > 1 && (
              <>
                {Array.from({ length: duplication - 1 }).map((_, i) => (
                  <ItemLeafDup key={`${item.id}-dup-${i}`} parentRef={{ __typename: 'Parent', id: PARENT_ID }} />
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ScenarioBContext = React.createContext<{ parentId: string; parentName: string } | null>(null);

const ScenarioB: React.FC<{ items: any[]; parentName: string }> = ({ items, parentName }) => {
  const pref = { __typename: 'Parent', id: PARENT_ID };
  const { data: parentData } = useFragment({ fragment: ParentName_fragment, from: pref });
  const ctxValue = useMemo(() => ({
    parentId: PARENT_ID,
    parentName: parentData?.name ?? parentName,
  }), [parentData?.name, parentName]);

  return (
    <div>
      <h3>Scenario B: Parent via context (no item fragment)</h3>
      <ScenarioBContext.Provider value={ctxValue}>
        <div>
          {items.map((item: any) => (
            <div key={item.id}>
              <BItemLeaf item={item} />
            </div>
          ))}
        </div>
      </ScenarioBContext.Provider>
    </div>
  );
};

const BItemLeaf: React.FC<{ item: { __typename: 'Item'; id: string; name: string } }> = ({ item }) => {
  const sctx = React.useContext(ScenarioBContext)!;
  return (
    <div style={{ padding: 2, borderBottom: '1px solid #eee' }}>
      <span>
        {item.id}, {item.name}, {sctx.parentId}, {sctx.parentName}
      </span>
    </div>
  );
};

