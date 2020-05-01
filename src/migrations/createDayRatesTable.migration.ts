import {ExchangeCurrencies} from "../types";

export function up(knex: any) {
    return knex.schema
        .createTable('dayRates', function (table: any) {
            table.increments('id').primary();
            table.date('ratesDate');
            table.string('provider');

            Object.values(ExchangeCurrencies)
                .forEach(currencyName => {
                    table.float(currencyName);
                })
        })
}

export function down(knex: any) {
    return knex.schema
        .dropTable("dayRates");
}

export const config = { transaction: false }