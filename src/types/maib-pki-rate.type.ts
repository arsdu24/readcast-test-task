import {ExchangeCurrencies, ExchangeRateProvidersEnum} from "./state.type";

export interface MaibPkiRate {
    currencies_name: ExchangeCurrencies,
    exchange_types_name: ExchangeRateProvidersEnum,
    buy: number,
    sell: number
}