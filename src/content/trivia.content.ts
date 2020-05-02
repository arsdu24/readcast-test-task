import {Content, ContentData, ContentId, ContentPreview, ContentRenderer} from "../botpress";
import {ExchangeRateProvidersEnum, MainFlowNodesEnum, TriviaContentFormData} from "../types";

@Content<TriviaContentFormData>({
    required: ['question', 'choices'],
    properties: {
        question: {
            title: 'Question',
            type: 'string'
        },
        choices: {
            title: 'Choices',
            type: 'array',
            items: {
                type: 'object',
                default: ''
            }
        }
    }
})

export class TriviaContent {
    static readonly id: string = 'trivia';

    @ContentId()
    static readonly OPERATIONS: string;

    @ContentId()
    static readonly PROVIDERS: string;

    @ContentData(() => TriviaContent.OPERATIONS)
    operations: TriviaContentFormData<MainFlowNodesEnum> = {
        question: "What can I do for you",
        choices: [
            {
                text: "Today’s Exchange Rates",
                value: MainFlowNodesEnum.TODAY_EXCHANGE_RATE
            },
            {
                text: "Exchange Rate Variation",
                value: MainFlowNodesEnum.EXCHANGE_RATE_VARIATION
            },
            {
                text: "Exchange Rates calculator",
                value: MainFlowNodesEnum.EXCHANGE_CALCULATOR
            }
        ],
        typing: false
    };

    @ContentData(() => TriviaContent.PROVIDERS)
    providers: TriviaContentFormData<ExchangeRateProvidersEnum> = {
        question: "Choose well my Lord",
        choices: [
            {
                text: "National Bank (BNM)",
                value: ExchangeRateProvidersEnum.BNM
            },
            {
                text: "Card Rate",
                value: ExchangeRateProvidersEnum.CARD
            },
            {
                text: "Exchange rate house",
                value: ExchangeRateProvidersEnum.PSV
            },
            {
                text: "Virament",
                value: ExchangeRateProvidersEnum.VIR
            }
        ],
        typing: true
    };

    @ContentRenderer()
    render(data: TriviaContentFormData): any {
        return {
            type: 'edited_message_text',
            text: data.question,
            question: data.question,
            quick_replies: data.choices.map(({ value, text }) => `<${value}> ${text}`),
            reply_markup: {
                inline_keyboard: [
                    data.choices.map(({ value: callback_data, text }) => ({ text, callback_data }))
                ]
            },
            typing: data.typing || '2s'
        }
    }

    @ContentPreview()
    preview(data: TriviaContentFormData): string {
        return `'Question: ${data.question}`
    }
}