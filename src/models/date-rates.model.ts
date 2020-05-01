import {RatesModel} from "./rates.model";

export class DateRatesModel extends RatesModel<number> {
    protected static table: string = 'dayRates';
}