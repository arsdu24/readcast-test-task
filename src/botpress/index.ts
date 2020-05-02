import {registerFlows} from "./flows";
import {registerContents} from "./content";
import {registerActions} from "./actions";
import {BotPressOptions} from "./types";
import {prepareBotFile} from "./utils";
import * as del from "del";
import { resolve } from 'path';

export * from './actions'
export * from './content'
export * from './flows'
export * from './types'

let resolveKnex: (knex: any) => void;
const knexPromise: Promise<any> = new Promise(resolve => {
    resolveKnex = resolve;
})

export async function getKnex() {
    return knexPromise;
}

export function register(options: BotPressOptions): (bp: any) => Promise<void> {
    return async (bp: any) => {
        const knex: any = await bp.db.get();

        if (options.botfile.migrationsDir) {
            await del([resolve(options.botfile.migrationsDir, './*.d.ts')])
            await knex.migrate.latest({
                directory: options.botfile.migrationsDir,
                tableName: 'readcast_migrations',
                loadExtensions: ['.js']
            })
        }

        await registerContents(bp, options);
        await registerFlows(bp, options)
        await registerActions(bp, options);

        resolveKnex(knex)
    }
}

export function boot(options: BotPressOptions): BotPressOptions['botfile']{
    return prepareBotFile(options.botfile);
}