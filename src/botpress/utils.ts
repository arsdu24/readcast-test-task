import {Class} from "utility-types";
import {BotFile, Data, FlowNodeDefinition, ProviderAction} from "./types";
import {snakeCase} from "lodash/fp";
import {resolve} from "path";

export function callOrGet<T = any>(callableOrData: ((...args: any[]) => T) | T, args: any[] = []): T {
    if ('function' === typeof callableOrData) {
        return (callableOrData as (...args: any[]) => T).apply(null, args);
    }

    return callableOrData;
}

export function getProviderActions(Target: Class<any>): ProviderAction<any>[] {
    const actions: ProviderAction<any>[] = Reflect.getMetadata('botpress:actions', Target) || [];

    Reflect.defineMetadata('botpress:actions', actions, Target);

    return actions
}

export function getContentData<T extends {}, D extends {}>(Flow: Class<T>): Data<T, D>[] {
    const data: Data<T, D>[] = Reflect.getMetadata('botpress:content-data', Flow) || [];

    Reflect.defineMetadata('botpress:content-data', data, Flow);

    return data;
}

export function getContentId<T extends {}>(Target: Class<T>): string {
    return (Target as any).id || snakeCase(Target.name)
}

export function parseFunctionalConditionToString(fn: (state: any) => boolean) {
    const regs = [
        /^function\s[^\(]+\([^\)]*\)\s*\{.+return\s*([^\;\}]+)\s*\}$/gm,
        /^\(*[^\)]*\)*\s*=>\s*\{*.+return\s+([^}]+).+\}$/gm,
        /^\(*[^\)]*\)*\s*=>\s*([^\}]+)$/gm,
    ];

    const theOne = regs.find(reg => fn.toString().match(reg));

    if (theOne) {
        return fn.toString().replace(theOne, '$1').trim()
    }

    return `(${fn.toString()})(state)`
}

export function getFlowNodes<T extends {}>(Flow: Class<T>): {[key in keyof T]?: FlowNodeDefinition<T>} {
    const nodes: {[key in keyof T]?: FlowNodeDefinition<T>} = Reflect.getMetadata('botpress:flow-nodes', Flow) || {};

    Reflect.defineMetadata('botpress:flow-nodes', nodes, Flow);

    return nodes;
}

export function getFlowNode<T extends {}>(Flow: Class<T>, nodeKey: keyof T): FlowNodeDefinition<T> {
    const nodes: {[key in keyof T]?: FlowNodeDefinition<any>} = getFlowNodes(Flow);
    let currentNode: FlowNodeDefinition<T> | undefined = nodes[nodeKey];

    if (!currentNode) {
        currentNode = {
            id: (target: T) => (target[nodeKey] as unknown as string),
            name: nodeKey as string,
            onEnter: null,
            onReceive: null,
            next: []
        };
    }

    return nodes[nodeKey] = currentNode;
}

export function prepareBotFile(botfile: BotFile): BotFile {

    if (!botfile.dataDir) {
        botfile.dataDir = resolve(botfile.projectPath, '.data')
    }

    if (!botfile.contentDir) {
        botfile.contentDir = resolve(botfile.projectPath, '.content')
    }

    if (!botfile.flowsDir) {
        botfile.flowsDir = resolve(botfile.projectPath, '.flows')
    }

    if (!botfile.contentDataDir) {
        botfile.contentDataDir = resolve(botfile.projectPath, '.content-data')
    }

    return botfile;
}