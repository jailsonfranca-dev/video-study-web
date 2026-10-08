import {
    useMemo
} from 'react';

import '@xyflow/react/dist/style.css';
import './StudyMaterialPanel.css';

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

import dagre
    from '@dagrejs/dagre';

import type {
    MindMapNode
} from '../../types/studyMaterial';

import {
    useTheme
} from '../../hooks/useTheme';


interface StudyMindMapProps {

    mindMap:
        MindMapNode;

}


interface MindMapPalette {

    background: string;

    nodeBackground: string;

    nodeRootBackground: string;

    nodeBorder: string;

    nodeRootBorder: string;

    nodeText: string;

    nodeDescription: string;

    edge: string;

    backgroundDots: string;

    miniMapBackground: string;

    miniMapNode: string;

    miniMapMask: string;

}


const NODE_WIDTH =
    260;


const NODE_HEIGHT =
    100;


/*
 * =========================================
 * PALETA DO MAPA
 * =========================================
 */

function getMindMapPalette(
    theme:
        'light' | 'dark'
): MindMapPalette {

    if (
        theme ===
        'dark'
    ) {

        return {

            background:
                '#111827',

            nodeBackground:
                '#1e293b',

            nodeRootBackground:
                '#172554',

            nodeBorder:
                '#475569',

            nodeRootBorder:
                '#3b82f6',

            nodeText:
                '#f8fafc',

            nodeDescription:
                '#cbd5e1',

            edge:
                '#64748b',

            backgroundDots:
                '#334155',

            miniMapBackground:
                '#111827',

            miniMapNode:
                '#475569',

            miniMapMask:
                'rgba(15, 23, 42, 0.70)'

        };

    }


    return {

        background:
            '#f8fafc',

        nodeBackground:
            '#ffffff',

        nodeRootBackground:
            '#eff6ff',

        nodeBorder:
            '#cbd5e1',

        nodeRootBorder:
            '#2563eb',

        nodeText:
            '#0f172a',

        nodeDescription:
            '#64748b',

        edge:
            '#94a3b8',

        backgroundDots:
            '#cbd5e1',

        miniMapBackground:
            '#ffffff',

        miniMapNode:
            '#cbd5e1',

        miniMapMask:
            'rgba(248, 250, 252, 0.75)'

    };

}


/*
 * =========================================
 * CONVERTER MIND MAP PARA REACT FLOW
 * =========================================
 */

function convertMindMapToFlow(

    root:
        MindMapNode,

    palette:
        MindMapPalette

): {

    nodes:
        Node[];

    edges:
        Edge[];

} {

    const nodes:
        Node[] =
        [];


    const edges:
        Edge[] =
        [];


    let nodeCounter =
        0;


    function visit(

        node:
            MindMapNode,

        parentId?:
            string,

        depth =
            0

    ) {

        const id =
            `mind-${nodeCounter++}`;


        const isRoot =
            depth ===
            0;


        nodes.push({

            id,

            position: {

                x: 0,

                y: 0

            },
            width: NODE_WIDTH,
            height: NODE_HEIGHT,

            sourcePosition:
            Position.Bottom,

            targetPosition:
            Position.Top,


            data: {

                depth,

                label: (

                    <div
                        className="mind-map-node-content"
                    >

                        <strong
                            style={{
                                color:
                                palette.nodeText
                            }}
                        >

                            {
                                node.title
                            }

                        </strong>


                        {
                            node.description && (

                                <span
                                    style={{
                                        color:
                                        palette
                                            .nodeDescription
                                    }}
                                >

                                    {
                                        node.description
                                    }

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

                border:
                    `1px solid ${
                        isRoot
                            ? palette
                                .nodeRootBorder
                            : palette
                                .nodeBorder
                    }`,

                background:
                    isRoot
                        ? palette
                            .nodeRootBackground
                        : palette
                            .nodeBackground,

                color:
                palette
                    .nodeText,

                boxShadow:
                    isRoot
                        ? '0 6px 20px rgba(0, 0, 0, 0.18)'
                        : '0 2px 8px rgba(0, 0, 0, 0.10)',

                textAlign:
                    'center',

                whiteSpace:
                    'normal',

                transition:
                    'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'

            }

        });


        /*
         * =================================
         * EDGE PAI → FILHO
         * =================================
         */

        if (
            parentId
        ) {

            edges.push({

                id:
                    `${parentId}-${id}`,

                source:
                parentId,

                target:
                id,

                type:
                    'smoothstep',

                animated:
                    false,

                style: {

                    stroke:
                    palette.edge,

                    strokeWidth:
                        2.5,

                    strokeOpacity:
                        1

                },

                markerEnd: {

                    type:
                    MarkerType
                        .ArrowClosed,

                    color:
                    palette.edge,

                    width:
                        18,

                    height:
                        18

                }

            });

        }


        /*
         * =================================
         * FILHOS
         * =================================
         */

        for (
            const child
            of
        node.children ??
        []
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
     * =========================================
     * DAGRE
     * =========================================
     */

    const graph =
        new dagre
            .graphlib
            .Graph();


    graph
        .setDefaultEdgeLabel(
            () => ({})
        );


    graph
        .setGraph({

            /*
             * Top → Bottom
             */
            rankdir:
                'TB',


            /*
             * Espaçamento horizontal
             */
            nodesep:
                70,


            /*
             * Espaçamento vertical
             */
            ranksep:
                100,


            /*
             * Espaçamento entre edges
             */
            edgesep:
                30,


            align:
            undefined

        });


    /*
     * =========================================
     * TAMANHO DOS NODES
     * =========================================
     */

    for (
        const node
        of
        nodes
        ) {

        graph
            .setNode(

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
     * =========================================
     * RELAÇÕES
     * =========================================
     */

    for (
        const edge
        of
        edges
        ) {

        graph
            .setEdge(

                edge.source,

                edge.target

            );

    }


    /*
     * =========================================
     * CALCULAR LAYOUT
     * =========================================
     */

    dagre.layout(
        graph
    );


    /*
     * =========================================
     * CONVERTER COORDENADAS
     * =========================================
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


/*
 * =============================================
 * COMPONENTE
 * =============================================
 */

export function StudyMindMap({

                                 mindMap

                             }: StudyMindMapProps) {

    /*
     * =========================================
     * THEME
     * =========================================
     */

    const {
        theme
    } =
        useTheme();


    /*
     * =========================================
     * PALETA
     * =========================================
     */

    const palette =
        useMemo(
            () =>
                getMindMapPalette(
                    theme
                ),
            [
                theme
            ]
        );


    /*
     * =========================================
     * NODES + EDGES
     * =========================================
     */

    const {

        nodes,

        edges

    } =
        useMemo(
            () =>
                convertMindMapToFlow(

                    mindMap,

                    palette

                ),
            [
                mindMap,
                palette
            ]
        );


    /*
     * =========================================
     * RENDER
     * =========================================
     */

    return (

        <div
            className="mind-map-container"
        >

            <ReactFlow

                nodes={
                    nodes
                }

                edges={
                    edges
                }

                colorMode={
                    theme
                }



                /*
                 * =================================
                 * FIT VIEW
                 * =================================
                 */

                fitView

                fitViewOptions={{

                    padding:
                        0.2,

                    duration:
                        400

                }}


                /*
                 * =================================
                 * INTERAÇÃO
                 * =================================
                 */

                nodesDraggable={
                    false
                }

                nodesConnectable={
                    false
                }

                elementsSelectable


                /*
                 * =================================
                 * ZOOM
                 * =================================
                 */

                minZoom={
                    0.2
                }

                maxZoom={
                    1.5
                }


                /*
                 * =================================
                 * FUNDO
                 * =================================
                 */

                style={{

                    background:
                    palette.background

                }}

            >

                {/*
                 * =================================
                 * BACKGROUND
                 * =================================
                 */}

                <Background

                    gap={
                        20
                    }

                    size={
                        1
                    }

                    color={
                        palette
                            .backgroundDots
                    }

                />


                {/*
                 * =================================
                 * CONTROLS
                 * =================================
                 */}

                <Controls />


                {/*
                 * =================================
                 * MINIMAP
                 * =================================
                 */}

                <MiniMap

                    nodeColor={
                        palette
                            .miniMapNode
                    }

                    bgColor={
                        palette
                            .miniMapBackground
                    }

                    maskColor={
                        palette
                            .miniMapMask
                    }

                    pannable

                    zoomable

                />

            </ReactFlow>

        </div>

    );

}