import Axios from 'axios';
import {DateTime} from 'luxon';
import {getKnex} from "../botpress";
import {
    CurrencyCalculatedAmountState,
    ExchangeCurrencies,
    ExchangeRateProvidersEnum,
    RateVariationState,
    TodayRateState,
    MaibPkiRate
} from "../types";
import {DateRatesModel, DateRatesVariationModel} from "../models";

export class MaibPkiService {

    async fetchDateRatesRecord(ratesDate: Date, provider: ExchangeRateProvidersEnum): Promise<TodayRateState> {
        const timestamp: string = DateTime.fromJSDate(ratesDate).toFormat('yyyyMMdd');
        const maibPkiUrl: string = `http://pki.maib.md/rates/${provider}${timestamp}.json`;
        const { data: rates } = await Axios.get<MaibPkiRate[]>(maibPkiUrl);

        return rates.reduce((todayRates: TodayRateState, rate: MaibPkiRate): TodayRateState => {
            if (Object.values(ExchangeCurrencies).includes(rate.currencies_name)) {
                todayRates[rate.currencies_name] = +rate.buy.toFixed(2)
            }

            return todayRates
        }, {} as TodayRateState)
    }

    async getTodayRates(provider: ExchangeRateProvidersEnum, ratesDate: Date = new Date()): Promise<TodayRateState> {
        let dateRates: DateRatesModel | undefined = await DateRatesModel.findOneByDateAndProvide(provider, ratesDate);

        if (!dateRates) {
            dateRates = {
                ratesDate,
                provider,
                ...(await this.fetchDateRatesRecord(ratesDate, provider))
            }

            await DateRatesModel.save(dateRates)
        }

        const { ratesDate: a, provider: b, id, ...rest } = dateRates;

        return rest;
    }

    async getRateVariation(provider: ExchangeRateProvidersEnum): Promise<RateVariationState> {
        const ratesDate: Date = new Date()
        let dateRatesVariation: DateRatesVariationModel | undefined = await DateRatesVariationModel.findOneByDateAndProvide(provider, ratesDate);

        if (!dateRatesVariation) {
            dateRatesVariation = {
                ratesDate,
                provider,
                ...(await this.calculateRateVariation(provider))
            }

            await DateRatesVariationModel.save(dateRatesVariation)
        }

        const { provider: p, ratesDate: r, id, ...rest } =  dateRatesVariation

        return rest;
    }

    async calculateRateVariation(provider: ExchangeRateProvidersEnum): Promise<RateVariationState> {
        const ratesDate: Date = new Date()
        const yesterdayRates: TodayRateState = await this.getTodayRates(provider, DateTime.fromJSDate(ratesDate).minus({ day: 1 }).toJSDate());
        const todayRates: TodayRateState = await this.getTodayRates(provider);

        return Object.entries(todayRates)
            .reduce((variation: RateVariationState, [currency, rate]): RateVariationState => {
                const yesterdayRate: number = yesterdayRates[currency as ExchangeCurrencies];
                variation[currency as ExchangeCurrencies] = {
                    rate,
                    type: yesterdayRate === rate ? '' : yesterdayRate < rate ? '↑' : '↓'
                };

                return variation;
            }, {} as RateVariationState)
    }

    async getCurrencyCalculatedAmountState(provider: ExchangeRateProvidersEnum, input: number): Promise<CurrencyCalculatedAmountState> {
        const todayRates: TodayRateState = await this.getTodayRates(provider);

        return Object.entries(todayRates)
            .reduce((calculatedAmount: CurrencyCalculatedAmountState, [currency, rate]): CurrencyCalculatedAmountState => ({
                ...calculatedAmount,
                [currency as ExchangeCurrencies]: (input / rate).toFixed(2),
            }), {} as CurrencyCalculatedAmountState)
    }
}
