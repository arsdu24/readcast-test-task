import 'reflect-metadata'
import {Class} from "utility-types";
import {kebabCase} from 'lodash/fp';
import {BotPressOptions, FlowDefinition, FlowNodeDefinition} from './types'
import {callOrGet, getFlowNode, getFlowNodes, parseFunctionalConditionToString} from "./utils";

export async function registerFlows(bp: any, options: BotPressOptions): Promise<void> {
    await bp.dialogEngine.flowProvider.saveFlows(
        options.flowProviders.map((Flow: Class<any>): FlowDefinition => {
            const flowTarget: any = new Flow();
            const name: string = Reflect.getMetadata('botpress:flow-name', Flow) || Flow.name;
            const version: string = Reflect.getMetadata('botpress:flow-version', Flow) || '0.1';
            const startNode: string = Reflect.getMetadata('botpress:flow-start-node-name', Flow) || 'entry';
            const nodes: FlowNodeDefinition<any>[] = Object.values(getFlowNodes(Flow))
                .filter((node: FlowNodeDefinition<any> | undefined): node is FlowNodeDefinition<any> => !!node)
                .map(node => ({
                    ...node,
                    onEnter: node.onEnter && node.onEnter.map(value => callOrGet(value)),
                    onReceive: node.onReceive && node.onReceive.map(value => callOrGet(value)),
                    id: callOrGet(node.id, [flowTarget])
                }));
            const flow: string = kebabCase(name).replace(/-flow$/, '.flow.json');
            const location: string = flow

            return {
                flow,
                location,
                version,
                startNode,
                nodes,
            }
        })
    )
}

export function Flow(): ClassDecorator {
    return <TFunction extends Function>(Target: TFunction) => {

        Reflect.defineMetadata('botpress:flow-name', Target.name, Target);
        Reflect.defineMetadata('botpress:flow-version', Target.prototype.version, Target.prototype);

        return Target;
    }
}

export function FlowNode() {
    return <T extends {}>(target: T, propertyKey: any) => {
        getFlowNode(target.constructor as Class<T>, propertyKey);
    }
}

export function FlowStartNode() {
    const nodeDecorator = FlowNode();

    return <T extends {}>(target: T, propertyKey: any) => {
        Reflect.defineMetadata('botpress:flow-start-node-name', propertyKey, target.constructor);

        nodeDecorator(target, propertyKey);
    }
}

export function OnEnter(...actions: ((() => string) | string)[]) {
    return <T extends {}>(target: T, propertyKey: any) => {
        const currentNode: FlowNodeDefinition<T> = getFlowNode(target.constructor as Class<T>, propertyKey);

        currentNode.onEnter = actions
    }
}

export function OnReceive(...actions: ((() => string) | string)[]) {
    return <T extends {}>(target: T, propertyKey: any) => {
        const currentNode: FlowNodeDefinition<T> = getFlowNode(target.constructor as Class<T>, propertyKey);

        currentNode.onReceive = actions
    }
}

export function Next(otherwiseNode: string): <T extends {}>(target: T, propertyKey: any) => void;
export function Next(condition: (state: any) => boolean, node: string): <T extends {}>(target: T, propertyKey: any) => void;
export function Next(nodeOrCondition: ((state: any) => boolean) | string, node?: string) {
    return <T extends {}>(target: T, propertyKey: any) => {
        const currentNode: FlowNodeDefinition<T> = getFlowNode(target.constructor as Class<T>, propertyKey);

        if ('string' === typeof nodeOrCondition) {
            currentNode.next.unshift({ condition: 'true', node: nodeOrCondition })
        } else if(node) {
            currentNode.next.unshift({ condition: parseFunctionalConditionToString(nodeOrCondition), node })
        }
    }
}