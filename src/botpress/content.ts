import {Class} from "utility-types";
import {snakeCase} from "lodash/fp";
import {BotPressOptions, ContentDefinition, ContentSchema, Data} from "./types";
import {callOrGet, getContentData, getContentId} from "./utils";

const contentDataIdMap: Map<string, string> = new Map();

export async function registerContents(bp: any, options: BotPressOptions): Promise<void> {
    await Promise.all(
        options.contentProviders.map((Content: Class<any>): ContentDefinition<any> => {
            const contentTarget: any = new Content();
            const id: string = getContentId(Content);
            const title: string = Reflect.getMetadata('botpress:content-title', Content) || Content.name;
            const jsonSchema: ContentSchema<any> = Reflect.getMetadata('botpress:content-schema', Content);
            const computePreviewText: (data: any) => string = Reflect.getMetadata('botpress:content-preview-text', Content);
            const computeData: (data: any) => any = Reflect.getMetadata('botpress:content-computed-data', Content);
            const renderer: (data: any) => any = Reflect.getMetadata('botpress:content-renderer', Content);
            const data: Data<any, any>[] = Reflect.getMetadata('botpress:content-data', Content) || [];

            return {
                id,
                schema: {
                    id,
                    title,
                    renderer: `#${id}`,
                    jsonSchema,
                    computePreviewText,
                    uiSchema: {
                        variations: {
                            "ui:options": {
                                orderable: false
                            }
                        }
                    },
                    computeMetadata: null,
                    computeData
                },
                data: data.map(({idResolver, formDataResolver}) => ({
                    id: idResolver(),
                    formData: formDataResolver(contentTarget)
                })),
                renderer
            }
        })
            .map(async ({ id: categoryId, renderer, schema, data }) => {
                bp.contentManager.loadCategoryFromSchema(schema);

                await Promise.all(
                    data.map( async ({id: itemId, formData}) => {
                        contentDataIdMap.set(
                            itemId,
                            await bp.contentManager.createOrUpdateCategoryItem({ categoryId, formData })
                        )
                    })
                )

                bp.contentManager.registerGetItemProvider('alias', (knex: any, category: string, alias: string) => {
                    const itemFullAlias: string = `${category}-alias(${alias})`;
                    let id: string = `${category}-${alias}`;

                    if (contentDataIdMap.has(itemFullAlias)) {
                        id = contentDataIdMap.get(itemFullAlias)!
                    }

                    return knex('content_items').where({ id }).get(0)
                })

                bp.renderers.register(`#${categoryId}`, renderer);
            })
    )
}

export function Content<D extends {}>(schema: ContentSchema<D>) {
    return <TFunction extends Class<any>>(Target: TFunction) => {

        Reflect.defineMetadata('botpress:content-id', getContentId(Target as Class<any>), Target);
        Reflect.defineMetadata('botpress:content-title', (Target as any).title || Target.name, Target.prototype);
        Reflect.defineMetadata('botpress:content-schema', schema, Target);

        return Target;
    }
}

export function ContentId<D extends {}>() {
    return <T extends Class<any>, K extends keyof T>(target: T, propertyKey: K) => {
        target[propertyKey] = `${getContentId(target as Class<any>)}-alias(${snakeCase(propertyKey.toString())})` as any
    }
}

export function ContentData<D extends {}>(idResolver: string | (() => string)) {
    return <T extends {}, K extends keyof T>(target: T, propertyKey: K) => {
        const data: Data<T, D>[] = getContentData(target.constructor as Class<T>);

        data.push({
            idResolver: () => callOrGet(idResolver),
            formDataResolver: (target: T) => (target[propertyKey] as unknown as D)
        })
    }
}

export function ContentRenderer() {
    return <T extends {}, K extends keyof T>(target: T, propertyKey: K) => {
        Reflect.defineMetadata('botpress:content-renderer', target[propertyKey], target.constructor);
    }
}

export function ContentPreview() {
    return <T extends {}, K extends keyof T>(target: T, propertyKey: K) => {
        Reflect.defineMetadata('botpress:content-preview-text', target[propertyKey], target.constructor);
    }
}

export function Say(contentIdentification: string): () => string;
export function Say(contentIdentificationResolver: () => string): () => string
export function Say(contentIdentificationOrResolver: string | (() => string)): () => string {
    return () => `say #!${callOrGet(contentIdentificationOrResolver)}`
}