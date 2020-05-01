import {MainFlowNodesEnum} from "./main-flow-node.type";

export enum ExchangeCurrencies {
    USD = 'USD',
    EUR = 'EUR',
    RUB = 'RUB',
    RON = 'RON',
    UAH = 'UAH',
}

export enum ExchangeRateProvidersEnum {
    BNM = "BNM",
    PSV = "PSV",
    VIR = "VIR",
    CARD = "CARD",
}

export type TodayRateState = { [key in ExchangeCurrencies]: number }
export type CurrencyVariation = {
    rate: number,
    type: '' | '↑' | '↓'
}
export type RateVariationState = {
    [key in ExchangeCurrencies]: CurrencyVariation;
}
export type CurrencyCalculatedAmountState = {
    [key in ExchangeCurrencies]: number;
}

export interface State {
    operation: MainFlowNodesEnum | null,
    provider: ExchangeRateProvidersEnum | null,
    providerName: string | null,
    todayRate: null | TodayRateState,
    rateVariation: null | RateVariationState,
    input: null | number,
    isInputValid: boolean,
    currencyAmount: null | CurrencyCalculatedAmountState
}
