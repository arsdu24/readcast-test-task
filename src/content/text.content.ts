import {Content, ContentData, ContentId, ContentPreview, ContentRenderer} from "../botpress";
import {TextContentFormData} from "../types";

@Content<TextContentFormData>({
    required: ['text'],
    properties: {
        text: {
            title: 'Message',
            type: 'string'
        },
        typing: {
            title: 'Show typing indicators',
            type: 'boolean',
            default: true
        }
    }
})
export class TextContent {
    static readonly id: string = 'text';

    @ContentId()
    static readonly GREETINGS: string;

    @ContentId()
    static readonly BAD_ANSWER: string;

    @ContentId()
    static readonly TODAY_RATES: string;

    @ContentId()
    static readonly RATE_VARIATION: string;

    @ContentId()
    static readonly ASK_INPUT_FOR_EXCHANGE_CALCULATOR: string;

    @ContentId()
    static readonly INVALID_INPUT_FOR_EXCHANGE_CALCULATOR: string;

    @ContentId()
    static readonly EXCHANGE_CALCULATOR: string;

    @ContentData(() => TextContent.GREETINGS)
    greetings: TextContentFormData = {
        text: 'Greetings folks.',
        typing: false
    };

    @ContentData(() => TextContent.BAD_ANSWER)
    badAnswer: TextContentFormData = {
        text: 'Bad one, you should use one of generated quick replies.',
        typing: false
    };

    @ContentData(() => TextContent.ASK_INPUT_FOR_EXCHANGE_CALCULATOR)
    askInputForCalculator: TextContentFormData = {
        text: 'How much do you want to exchange?',
        typing: false
    };

    @ContentData(() => TextContent.INVALID_INPUT_FOR_EXCHANGE_CALCULATOR)
    invalidInputForCalculator: TextContentFormData = {
        text: 'Please put some valid number, do not try the fortune :@',
        typing: false
    };

    @ContentData(() => TextContent.TODAY_RATES)
    todayRate: TextContentFormData = {
        text: `Today Rate by '{{state.providerName}}' is:

    1 USD will cost you {{state.todayRate.USD}} MDL 
    1 EUR will cost you {{state.todayRate.EUR}} MDL
    1 RUB will cost you {{state.todayRate.RUB}} MDL
    1 RON will cost you {{state.todayRate.RON}} MDL
    1 UAH will cost you {{state.todayRate.UAH}} MDL`,
        typing: true
    };

    @ContentData(() => TextContent.EXCHANGE_CALCULATOR)
    exchangeCalculator: TextContentFormData = {
        text: `By today {{state.providerName}}'s rate {{state.input}} MDL is same as:

    {{state.currencyAmount.USD}} USD
    {{state.currencyAmount.EUR}} EUR
    {{state.currencyAmount.RUB}} RUB
    {{state.currencyAmount.RON}} RON
    {{state.currencyAmount.UAH}} UAH`,
        typing: true
    };

    @ContentData(() => TextContent.RATE_VARIATION)
    exchangeRateVariation: TextContentFormData = {
        text: `Rate Variation by '{{state.providerName}}' is:

    1 USD will cost you {{state.rateVariation.USD.rate}} {{state.rateVariation.USD.type}}
    1 EUR will cost you {{state.rateVariation.EUR.rate}} {{state.rateVariation.EUR.type}}
    1 RUB will cost you {{state.rateVariation.RUB.rate}} {{state.rateVariation.RUB.type}}
    1 RON will cost you {{state.rateVariation.RON.rate}} {{state.rateVariation.RON.type}}
    1 UAH will cost you {{state.rateVariation.UAH.rate}} {{state.rateVariation.UAH.type}}`,
        typing: true
    };

    @ContentRenderer()
    render({ text, typing }: TextContentFormData): TextContentFormData {
        return { text, typing: !!typing}
    }

    @ContentPreview()
    preview(data: TextContentFormData): string {
        return `Text: ${data.text}`
    }
}