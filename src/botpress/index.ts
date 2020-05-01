import {registerFlows} from "./flows";
import {registerContents} from "./content";
import {registerActions} from "./actions";
import {BotFile, BotPressOptions} from "./types";
import {prepareBotFile} from "./utils";
import {readdir, readFile} from "fs";
import {resolve} from "path";

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
        await registerContents(bp, options);
        await registerFlows(bp, options)
        await registerActions(bp, options);

        resolveKnex(bp.db.get())
    }
}

export function boot(options: BotPressOptions): BotPressOptions['botfile']{
    return prepareBotFile(options.botfile);
}