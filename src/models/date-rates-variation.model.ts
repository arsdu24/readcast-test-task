import {CurrencyVariation} from "../types";
import {RatesModel} from "./rates.model";

export class DateRatesVariationModel extends RatesModel<CurrencyVariation> {
    protected static table: string = 'dayRatesVariation';
}