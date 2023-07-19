import { ArrowBigLeft, PlusCircle } from 'lucide-react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeDragHandler,
  type OnNodesDelete,
  Panel,
} from 'reactflow';
import { type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomConnectionLine from '~/components/workboard/connection-line';
import {
  type NodeData,
  nodeTypes,
  useInitStoreQuery,
  useStoreActions,
  useStoreEdges,
  useStoreNodes,
  useStoreWorkspacePath,
} from '~/hooks/use-store';
import { api } from '~/utils/api';

import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { PlusOneNode } from './plusone-node';
import WorkspaceSelectDialog from './workspace-select-dialog';

/**
 * The Gepetto component is the main component for the workspace flow
 * It uses the ReactFlow component to render the nodes and edges
 * It also uses the zustand store to manage the state of the nodes and edges
 *
 * @returns
 */
function Gepetto({ workspacePath }: { workspacePath: string }) {
  const { nodes } = useStoreNodes();
  const { enableQuery } = useInitStoreQuery({ workspacePath });
  const { onNodesChange, onEdgesChange, setEnableQuery } = useStoreActions();
  const { edges, onEdgesConnect, onEdgesDelete } = useStoreEdges();

  const updateNodePos = api.workspace.updateNodePos.useMutation({
    onSuccess: (data) => {
      console.log('Geppetto: update node pos success', data);
    },
    onError: (e) => {
      console.log('Geppetto: update node pos error', e);
    },
  });
  const deleteNode = api.workspace.deleteNode.useMutation({
    onSuccess: (data) => {
      console.log('Geppetto: delete node success', data);
    },
    onError: (e) => {
      console.log('Geppetto: delete node error', e);
    },
  });

  const variant = BackgroundVariant.Dots;

  const nodeColor = (node: Node<NodeData>) => {
    switch (node.type) {
      case 'dataset':
        return '#6ede87';
      case 'new':
        return '#eb0ee3';
      case 'network':
        return '#3162c4';
      case 'inference':
        return '#eb870e';
      default:
        return '#ff0072';
    }
  };

  const onInit = () => {
    console.log('Geppetto: onInit');
    if (enableQuery) {
      setEnableQuery(false);
    }
  };

  const onNodeDragStop: NodeDragHandler = (event, node: Node<NodeData>) => {
    console.log('Geppetto: node drag stop', event, node);
    // how to differentiate a real movement from an involuntary click to activate or something else?
    updateNodePos.mutate({
      registryId: node.data.registryId,
      position: node.position as { x: number; y: number },
    });
  };

  const onNodesDelete: OnNodesDelete = (
    nodesToDelete: Node<NodeData>[] | undefined,
  ) => {
    if (!nodesToDelete) {
      return;
    }
    console.log('Geppetto: node delete', nodesToDelete);
    nodesToDelete.map((node) => {
      deleteNode.mutate({
        registryId: node.data.registryId,
      });
    });
  };

  //TODO: would be nice to change the height for full screen mode to h-[930px]
  return (
    <div className="p-2 h-[799px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange} // not really being used
        onConnect={onEdgesConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        connectionLineComponent={CustomConnectionLine}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
      >
        <Panel position="top-left" className="flex flex-col gap-2">
          <PlusOneNode />
        </Panel>
        {nodes.length === 0 && (
          <Panel position="top-center" className="flex flex-col gap-2">
            <AlertDemo />
          </Panel>
        )}
        <Controls
          showZoom={false}
          className="bg-transparent px-1 dark:fill-white [&>button:hover]:dark:bg-slate-700 [&>button]:dark:bg-muted [&>button]:rounded-sm [&>button]:border-none [&>button]:my-2"
        ></Controls>
        <MiniMap
          nodeColor={nodeColor}
          className="dark:bg-muted rounded-sm border-0 p-2"
          pannable
          zoomable
        />
        <Background variant={variant} gap={12} />
      </ReactFlow>
    </div>
  );
}

function AlertDemo() {
  return (
    <Alert>
      <ArrowBigLeft className="h-6 w-6 animate-bounce-x" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add <span className="text-purple-500 font-semibold">nodes</span>{' '}
        to your workspace by clicking on the{' '}
        <PlusCircle className="inline h-5 w-5" /> button on the top left corner.
      </AlertDescription>
    </Alert>
  );
}

/**
 *
 * @returns the Select if no workspacePath is set in the store or the Gepetto (Workspace Flow component) if it is
 */
export default function Flow() {
  const { workspacePath } = useStoreWorkspacePath();

  return (
    <>
      <WorkspaceSelectDialog open={!workspacePath} />
      {!!workspacePath && <Gepetto workspacePath={workspacePath} />}
    </>
  );
}
