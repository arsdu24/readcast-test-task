import {getKnex} from "../botpress";

export interface ModelQuery<M extends {}> {
    where(query: M | Partial<M>): Promise<M[]> & ModelQuery<M>;
    whereBetween<K extends keyof M>(key: K, values: (M[K])[]): Promise<M[]> & ModelQuery<M>;
    insert(data: M | Partial<M>): Promise<number>;
}

export abstract class BaseModel {
    protected static table: string;

    id?: number;

    static async query<T extends BaseModel>(): Promise<ModelQuery<T>> {
        const knex = await getKnex()

        return knex.table(this.table);
    }
}