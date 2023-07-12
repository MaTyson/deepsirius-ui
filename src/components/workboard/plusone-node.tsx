import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import { type Node } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { NodeTypesList } from '~/hooks/use-store';
import { type NodeData } from '~/hooks/use-store';
import useStore from '~/hooks/use-store';

// selects the type of node to be created using a dropdown menu
export function PlusOneNode() {
  const { addNode } = useStore(
    (state) => ({
      addNode: state.addNode,
    }),
    shallow,
  );

  const createNewNode = (nodeType: string) => {
    console.log('create new node of type:', nodeType);
    const newNode: Node<NodeData> = {
      id: nanoid(),
      type: nodeType,
      position: {
        // TODO: fix this
        x: 0,
        y: 0,
      },
      data: {},
    };
    addNode(newNode);
  };
  // the nodes that can be builded are defined in NodeTypesList except for the type "new"
  // which is used to create a new node
  const nodeTypesAllowed = NodeTypesList.filter(
    (nodeType) => nodeType !== 'new',
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="transition data-[state=open]:rotate-45 scale-100 data-[state=open]:scale-75"
        asChild
      >
        <Button
          title="add node"
          variant={'default'}
          size={'icon'}
          className="rounded-full"
        >
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Create New Node</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {nodeTypesAllowed.map((nodeType) => (
          <DropdownMenuItem
            onSelect={() => createNewNode(nodeType)}
            key={nodeType}
          >
            {nodeType}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}