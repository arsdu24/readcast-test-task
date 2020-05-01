import {BaseModel} from "./base.model";
import {ExchangeCurrencies, ExchangeRateProvidersEnum} from "../types";
import {DateTime} from "luxon";

export abstract class RatesModel<T> extends BaseModel {
    ratesDate!: Date;
    provider!: ExchangeRateProvidersEnum;

    [ExchangeCurrencies.EUR]!: T;
    [ExchangeCurrencies.USD]!: T;
    [ExchangeCurrencies.RUB]!: T;
    [ExchangeCurrencies.RON]!: T;
    [ExchangeCurrencies.UAH]!: T;

    static async findOneByDateAndProvide<T extends RatesModel<any>>(provider: ExchangeRateProvidersEnum, date: Date): Promise<T | undefined> {
        const query = await this.query<T>();
        const whereQuery: Partial<T> = {
            provider,
        } as Partial<T>

        const [record] = await query.where(whereQuery).whereBetween('ratesDate', [
            DateTime.fromJSDate(date).startOf('day').toJSDate(),
            DateTime.fromJSDate(date).endOf('day').toJSDate()
        ])

        return record;
    }

    static async save<T extends RatesModel<any>>(data: T | Partial<T>): Promise<void> {
        const query = await this.query<T>();

        await query.insert(data)
    }
}