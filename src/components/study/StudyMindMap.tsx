import {
    useMemo
} from 'react';

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Position,
    MarkerType
} from '@xyflow/react';

import type {
    Node,
    Edge
} from '@xyflow/react';

import dagre from '@dagrejs/dagre';

import type {
    MindMapNode
} from '../../types/studyMaterial';


interface StudyMindMapProps {
    mindMap: MindMapNode;
}


const NODE_WIDTH =
    260;

const NODE_HEIGHT =
    100;


function convertMindMapToFlow(
    root: MindMapNode
): {
    nodes: Node[];
    edges: Edge[];
} {

    const nodes: Node[] =
        [];

    const edges: Edge[] =
        [];


    let nodeCounter =
        0;


    function visit(
        node: MindMapNode,
        parentId?: string,
        depth = 0
    ) {

        const id =
            `mind-${nodeCounter++}`;


        nodes.push({

            id,

            position: {
                x: 0,
                y: 0
            },

            sourcePosition:
            Position.Bottom,

            targetPosition:
            Position.Top,

            data: {

                label: (

                    <div className="mind-map-node-content">

                        <strong>
                            {node.title}
                        </strong>

                        {
                            node.description && (

                                <span>
                                    {node.description}
                                </span>

                            )
                        }

                    </div>

                )

            },

            style: {

                width:
                NODE_WIDTH,

                minHeight:
                NODE_HEIGHT,

                padding:
                    '14px',

                borderRadius:
                    '10px',

                textAlign:
                    'center',

                whiteSpace:
                    'normal'
            }

        });


        if (parentId) {

            edges.push({

                id:
                    `${parentId}-${id}`,

                source:
                parentId,

                target:
                id,

                type:
                    'smoothstep',

                markerEnd: {
                    type:
                    MarkerType.ArrowClosed
                }

            });

        }


        for (
            const child
            of node.children ?? []
            ) {

            visit(
                child,
                id,
                depth + 1
            );

        }

    }


    visit(
        root
    );


    /*
     * Dagre
     */
    const graph =
        new dagre.graphlib.Graph();


    graph.setDefaultEdgeLabel(
        () => ({})
    );


    graph.setGraph({

        /*
         * TB = Top → Bottom
         */
        rankdir:
            'TB',

        /*
         * Espaço horizontal
         * entre nós do mesmo nível.
         */
        nodesep:
            70,

        /*
         * Espaço vertical
         * entre níveis.
         */
        ranksep:
            100,

        /*
         * Espaçamento entre edges.
         */
        edgesep:
            30,

        /*
         * Centraliza os níveis.
         */
        align:
        undefined

    });


    /*
     * Informa ao Dagre
     * tamanho de cada nó.
     */
    for (
        const node
        of nodes
        ) {

        graph.setNode(
            node.id,
            {
                width:
                NODE_WIDTH,

                height:
                NODE_HEIGHT
            }
        );

    }


    /*
     * Relações pai → filho.
     */
    for (
        const edge
        of edges
        ) {

        graph.setEdge(
            edge.source,
            edge.target
        );

    }


    /*
     * Calcula o layout.
     */
    dagre.layout(
        graph
    );


    /*
     * Dagre retorna coordenadas
     * referentes ao centro.
     *
     * React Flow trabalha com
     * canto superior esquerdo.
     */
    const layoutedNodes =
        nodes.map(
            node => {

                const position =
                    graph.node(
                        node.id
                    );


                return {

                    ...node,

                    position: {

                        x:
                            position.x -
                            NODE_WIDTH / 2,

                        y:
                            position.y -
                            NODE_HEIGHT / 2

                    }

                };

            }
        );


    return {

        nodes:
        layoutedNodes,

        edges
    };
}


export function StudyMindMap({
                                 mindMap
                             }: StudyMindMapProps) {

    const {
        nodes,
        edges
    } =
        useMemo(
            () =>
                convertMindMapToFlow(
                    mindMap
                ),
            [
                mindMap
            ]
        );


    return (

        <div className="mind-map-container">

            <ReactFlow

                nodes={
                    nodes
                }

                edges={
                    edges
                }

                fitView

                fitViewOptions={{
                    padding:
                        0.2,

                    duration:
                        400
                }}

                nodesDraggable={
                    false
                }

                nodesConnectable={
                    false
                }

                elementsSelectable

                minZoom={
                    0.2
                }

                maxZoom={
                    1.5
                }

            >

                <Background
                    gap={
                        20
                    }
                />

                <Controls />

                <MiniMap />

            </ReactFlow>

        </div>

    );
}