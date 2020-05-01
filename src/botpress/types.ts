import {Class} from "utility-types";

export interface ProviderAction<T extends {}> {
    id: string;
    name: string;
    description: string;
    params: { name: string; description: string}[];
    runner: BotPressAction<T>;
}

export interface ContentDefinition<T extends {}> {
    id: string;
    data: ({
        id: string;
        formData: Data<any, any>
    })[]
    schema: {
        id: string;
        title: string;
        renderer: string;
        jsonSchema: ContentSchema<T>;
        uiSchema?: {
            variations: {
                'ui:options': {
                    orderable: boolean
                }
            }
        },
        computePreviewText: (data: T) => string;
        computeData: (data: T) => any;
        computeMetadata?: any | null;
    },
    renderer: (data: T) => any;
}

export interface Data<T extends {}, D extends {}> {
    idResolver: () => string;
    formDataResolver: (target: T) => D;
}

export interface ContentSchema<T extends {}> {
    title?: string,
    description?: string,
    required: (keyof T)[],
    properties: {
        [K in keyof T]: {
            title?: string;
            description?: string;
            type: 'string' | 'object' | 'array' | 'number' | 'boolean';
            default?: T[K];
            items?: {
                type: 'string' | 'object' | 'array' | 'number' | 'boolean',
                default?: any
            }
        }
    }
}

export interface FlowDefinition {
    flow: string;
    location: string;
    version: string;
    startNode: string;
    nodes: FlowNodeDefinition<any>[]
}

export interface FlowNodeNext {
    condition: string;
    node: string;
}

export interface FlowNodeDefinition<T extends {}> {
    id: string | ((target: T) => string);
    name: string;
    onEnter: ((() => string) | string)[] | null;
    onReceive: ((() => string) | string)[] | null;
    next: FlowNodeNext[];
}

export interface BotFile {
    version: string;
    botUrl: string;
    port: number;
    projectPath: string;
    dataDir?: string;
    modulesConfigDir?: string;
    migrationsDir?: string;
    contentDir?: string;
    flowsDir?: string;
    contentDataDir?: string;
    logs: {
        enabled: boolean;
        keepDays: number;
    };
    api: {
        bodyMaxSize: string;
    };
    dialogs: {
        timeoutInterval: string;
        janitorInterval: string;
    };
    optOutStats: boolean;
    notification: {
        file: string;
        maxLength: number;
    };
    ghostContent: {
        enabled: boolean;
    };
    login: {
        enabled: boolean;
        tokenExpiry: string;
        password: string;
        maxAttempts: number;
        resetAfter: number;
    };
    postgres: {
        enabled: boolean;
        connection: string | undefined;
        host: string;
        port: string | number;
        user: string;
        password: string;
        database: string;
        ssl: string | boolean;
    };
    middleware?: {
        autoLoading: boolean;
    };
    config?: {
        'botpress-nlu': {
            intentsDir: string;
            entitiesDir: string;
        };
    };
    license?: {};
}

export interface BotPressOptions {
    botfile: BotFile;
    flowProviders: Class<any>[];
    actionProviders: Class<any>[];
    contentProviders: Class<any>[];
}

export type BotPressAction<T extends {}> = (state: T, event: any, args: any) => Promise<T> | T