import {ExchangeCurrencies} from "../types";

export function up(knex: any) {
    return knex.schema
        .createTable('dayRatesVariation', function (table: any) {
            table.increments('id').primary();
            table.date('ratesDate');
            table.string('provider');

            Object.values(ExchangeCurrencies)
                .forEach(currencyName => {
                    table.json(currencyName);
                })
        })
}

export function down(knex: any) {
    return knex.schema
        .dropTable("dayRatesVariation");
}

export const config = { transaction: false }