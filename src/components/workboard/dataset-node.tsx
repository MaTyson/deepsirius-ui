import { useInterpret, useSelector } from '@xstate/react';
import { useState } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';
import { State, type StateFrom, assign, createMachine } from 'xstate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/use-toast';
import {
  type NodeData,
  type NodeStatus,
  useStoreActions,
} from '~/hooks/use-store';
import { api } from '~/utils/api';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  DatasetForm,
  type FormProps,
  type FormType,
} from './node-component-forms/dataset-form';

interface JobEvent {
  type: 'done.invoke';
  data: { jobId?: string; jobStatus?: string; formData?: FormType };
}

const datasetMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2AzMAnMqDGYAdGgIZ4AuyAbmAMRmVUnlgDaADALqKgAOA9rGSV+qHiAAeiAIwA2AMyEAnCqUB2JQCYAHEoCs2te1kAaEAE9E82ZsJrNsvWoAsavUtnsdzgL4+zaJg4+EQM1HSw5CRY5BzcSCACQiJiCVIIzuxqhM6a0tp67tq60vLWZpYI1rb2jnoKes7S7OzafgEY2LgEhABGAK6w5oS8uBBoULQQokRoVPwA1kSw-b0AtsIAUvy9ceJJwsii4unarTnazvJn7HqamhraFYhOeoROmlrSV9Vl7SCBLohPqDYajVDjVCTbBYfhYEYAG2Y6Dha0IK3WWx2ewSBxSJxkOiUhHkVzU8nJmnkSmkBmeCAeb1qTjUcmk9n0-0BwR6AyGhCw-VQqAmUxmxFQ8yWEqC3SIfOGguFEwQc34eGYR1QcRxfEEh2OaUJuhJZIp8ipNLpFkQskMhBaam09yUZPuei5nR58tBAqFIqhYtQs0lixDsuBCr9yqhqtDGpSOuk8T1yS1BIQ0k+xNJ5sp1NpTxtCHctkdzoM0izzl8-gBXrlIP5SoDk2mwYlUvDQN5vpbKrVCa1Os0KcS+vxRsz2dNeYtBetlQUxL0WWdZJc2gtnojveb-tF7ZDXZlPZ9+5jUDj8yHoh18jHePTU-U2T08izdyyt2a8npziUdhlE+IwyircktB3M8m0VA9Aw1EIEV1cc00NUB0maZxtByPJLjtJRikA0xi2pZxlDURwKJrLCAOkKDvUIGE4VoHByCwcxkKfNDJBeFoHSdLMXGuRp1HpbRpHeFoWmkQCrgcLD6MbFY8AIWBYFodA0DAcghTYLh9gnZ90N4oC10Eq4CgAtR6QoiSiM0XImnfJ0lD8OtUH4CA4HEbk5QM1DUmMhAAFpiMqULFOBUgKHCfyDUCniMk0elrEUe5KNcdxPG8SKejCGg4snIKdDeXJ8go2QVAtBQUoUQh0qcTKPC8S5cvPSpU3ijMsOyMyHgskTrJIrIcgogwKTk8lZFrDpd3akYxgmQqjMS983j6oTLNE4tChXACAIc75qXkNqYOjVtlu4jCvCA1133Yax8iaYp6QMbDih0TRnLJGxTqYrBLoSjCbAku0XCUakFBrelPv4xxdGdZpvtO5TVPgXFDKumQDDeD8HK3ORDDOP9i0qiT3CrMrZCh0k3J8IA */
  id: 'dataset',
  schema: {
    context: {} as {
      jobId: string;
      jobStatus: string;
      datasetName: string;
      data: FormProps['data'];
    },
    events: {} as
      | { type: 'activate' }
      | { type: 'start'; data: { formData: FormType } }
      | { type: 'cancel' }
      | { type: 'retry'; data: { formData: FormType } }
      | { type: 'finetune'; data: { formData: FormType } },
  },
  initial: 'active',
  context: {
    jobId: '',
    jobStatus: '',
    datasetName: 'dataset',
    data: [],
  },
  states: {
    active: {
      on: {
        start: 'busy',
      },
      tags: ['active'],
    },
    busy: {
      initial: 'pending',
      tags: ['busy'],
      states: {
        pending: {
          invoke: {
            id: 'submitJob',
            src: 'submitJob',
            onDone: {
              target: 'running',
              actions: assign({
                jobId: (context, event: JobEvent) => event.data.jobId ?? '',
                datasetName: (context, event: JobEvent) =>
                  event.data.formData?.datasetName ?? '',
                data: (context, event: JobEvent) =>
                  event.data.formData?.data ?? [],
              }),
            },
            onError: {
              target: '#dataset.error',
            },
          },
        },
        running: {
          invoke: {
            src: 'jobStatus',
            onDone: [
              {
                target: '#dataset.success',
                cond: 'isCompleted',
              },
              {
                target: '#dataset.error',
                cond: 'isFailed',
              },
              {
                target: '#dataset.error',
                cond: 'isCancelled',
              },
              {
                target: 'running',
                actions: assign({
                  jobStatus: (context, event: JobEvent) =>
                    event.data.jobStatus ?? '',
                }),
              },
            ],
          },
          on: {
            cancel: {
              actions: 'cancelJob',
            },
          },
        },
      },
    },
    error: {
      tags: ['error'],
      on: {
        retry: {
          target: 'busy',
          actions: assign({ jobStatus: '' }),
        },
      },
    },
    success: {
      tags: ['success'],
      on: {
        finetune: {
          target: 'busy',
          actions: assign({ jobStatus: '' }),
        },
      },
    },
  },
  predictableActionArguments: true,
});
export type DatasetXState = StateFrom<typeof datasetMachine>;

export function DatasetNode({ id, data }: NodeProps<NodeData>) {
  const createJob = api.remotejob.create.useMutation();
  const checkJob = api.remotejob.status.useMutation();
  const cancelJob = api.remotejob.cancel.useMutation();
  // const { onUpdateNode } = useStoreNodes();
  const { onUpdateNode } = useStoreActions();
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(data.status);

  const prevXState = State.create(
    data.xState
      ? (JSON.parse(data.xState) as DatasetXState)
      : datasetMachine.initialState,
  );

  const actor = useInterpret(
    datasetMachine,
    // options
    {
      state: prevXState,
      guards: {
        isCompleted: (context) => {
          return context.jobStatus === 'COMPLETED';
        },
        isFailed: (context) => {
          return context.jobStatus === 'FAILED';
        },
        isCancelled: (context) => {
          return context.jobStatus === 'CANCELLED';
        },
      },
      actions: {
        cancelJob: (context) => {
          cancelJob.mutate({ jobId: context.jobId });
        },
      },
      services: {
        submitJob: (_, event) => {
          return new Promise((resolve, reject) => {
            const formData =
              event.type !== 'cancel' && event.type !== 'activate'
                ? event.data.formData
                : '';
            console.log('data submit: ', formData);
            const jobInput = {
              jobName: 'deepsirius-dataset',
              output: 'deepsirius-dataset-output.txt',
              error: 'deepsirius-dataset-error.txt',
              ntasks: 1,
              partition: 'proc2',
              command:
                'echo "' +
                JSON.stringify({ ...formData, ...data }) +
                '" \n sleep 5 \n echo "job completed."',
            };
            createJob
              .mutateAsync(jobInput)
              .then((data) => {
                resolve({ ...data, formData });
              })
              .catch((err) => reject(err));
          });
        },
        jobStatus: (context) => {
          return new Promise((resolve, reject) => {
            checkJob
              .mutateAsync({ jobId: context.jobId })
              .then((data) => {
                resolve(data);
              })
              .catch((err) => reject(err));
          });
        },
      },
    },
    // observer
    (state) => {
      const newStatus = [...state.tags][0] as NodeStatus;
      if (newStatus !== nodeStatus) {
        // update the local state
        setNodeStatus(newStatus);
        // update the node data in the store
        onUpdateNode({
          id: id, // this is the component id from the react-flow
          data: {
            ...data,
            status: newStatus,
            xState: JSON.stringify(state),
          },
        });
      }
    },
  );

  const selector = (state: DatasetXState) => {
    return {
      jobId: state.context.jobId,
      jobStatus: state.context.jobStatus,
      datasetName: state.context.datasetName,
      contextData: state.context.data,
    };
  };

  const { jobId, jobStatus, datasetName, contextData } = useSelector(
    actor,
    selector,
  );

  return (
    <Card
      data-state={nodeStatus}
      className="w-[455px] data-[state=active]:bg-green-100 data-[state=busy]:bg-yellow-100
    data-[state=error]:bg-red-100 data-[state=inactive]:bg-gray-100
    data-[state=success]:bg-blue-100 data-[state=active]:dark:bg-teal-800
    data-[state=busy]:dark:bg-amber-700 data-[state=error]:dark:bg-rose-700
    data-[state=inactive]:dark:bg-muted data-[state=success]:dark:bg-cyan-700"
    >
      <CardHeader>
        <CardTitle>{datasetName}</CardTitle>
        <CardDescription>{nodeStatus}</CardDescription>
      </CardHeader>
      {nodeStatus === 'active' && (
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Lets bake some data!</AccordionTrigger>
              <AccordionContent>
                <DatasetForm
                  data={[
                    {
                      image: '/path/to/my/image',
                      label: '/path/to/my/label',
                    },
                  ]}
                  onSubmitHandler={(formSubmitData) => {
                    actor.send({
                      type: 'start',
                      data: { formData: formSubmitData },
                    });
                    toast({
                      title: 'You submitted the following values:',
                      description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                          <code className="text-white">
                            {JSON.stringify(
                              { ...formSubmitData, ...data },
                              null,
                              2,
                            )}
                          </code>
                        </pre>
                      ),
                    });
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
      {nodeStatus === 'busy' && (
        <>
          <CardContent>
            <div className="flex flex-col">
              <p className="mb-2 text-3xl font-extrabold text-center">
                {jobId}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {jobStatus}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => {
                actor.send('cancel');
                toast({
                  title: 'Canceling job...',
                });
              }}
            >
              cancel
            </Button>
          </CardFooter>
        </>
      )}
      {nodeStatus === 'error' && (
        <CardContent>
          <div className="flex flex-col">
            <p className="mb-2 text-3xl font-extrabold text-center">{jobId}</p>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {jobStatus}
            </p>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Retry?</AccordionTrigger>
              <AccordionContent>
                <DatasetForm
                  name={datasetName}
                  data={contextData}
                  onSubmitHandler={(data) => {
                    actor.send({
                      type: 'retry',
                      data: { formData: data },
                    });
                    toast({
                      title: 'You submitted the following values:',
                      description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                          <code className="text-white">
                            {JSON.stringify(data, null, 2)}
                          </code>
                        </pre>
                      ),
                    });
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
      {nodeStatus === 'success' && (
        <CardContent>
          <div className="flex flex-col">
            <p className="mb-2 text-3xl font-extrabold text-center">{jobId}</p>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {jobStatus}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {`Successfully generated ${datasetName}.h5`}
            </p>
          </div>
        </CardContent>
      )}
      {nodeStatus === 'inactive' && (
        <CardFooter className="flex justify-start">
          <Button onClick={() => actor.send('activate')}>activate</Button>
        </CardFooter>
      )}
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
