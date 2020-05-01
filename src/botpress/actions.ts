import {Class} from "utility-types";
import {BotPressAction, BotPressOptions, ProviderAction} from "./types";
import {getProviderActions} from "./utils";

export async function registerActions(bp: any, options: BotPressOptions) {
    const actions: ProviderAction<any>[] = options.actionProviders.reduce((actions: ProviderAction<any>[], Target: Class<any>) => [
        ...actions,
        ...getProviderActions(Target)
    ], []);
    const actionsMetaMap: Map<string, ProviderAction<any>> = new Map();
    const actionsRecords: Record<string, BotPressAction<any>> = {};

    actions.forEach((action: ProviderAction<any>) => {
        actionsMetaMap.set(action.id, action);
        actionsRecords[action.id] = action.runner;
    })

    await bp.dialogEngine.registerActionMetadataProvider((actionId: string) => {
        const action: ProviderAction<any> | undefined = actionsMetaMap.get(actionId);

        if (!action) {
            return {}
        }

        return {
            description: action.description,
            params: action.params
        }
    });

    await bp.dialogEngine.registerFunctions(actionsRecords)
}

export function Action(description?: string, params?: { name: string; description: string}[]) {
    return <T extends {}>(target: T, propertyKey: string) => {
        const name: string = propertyKey.toString();

        getProviderActions(target.constructor as Class<T>).push({
            id: propertyKey.toString(),
            name,
            description: description || name,
            params: params || [],
            runner: (state: any, event: any, args: any) => {
                const instance: T = new (target.constructor as Class<T>)();

                return (instance[propertyKey as keyof T] as unknown as BotPressAction<any>)(state, event, args);
            }
        })
    }
}