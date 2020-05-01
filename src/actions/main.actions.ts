import {Action} from "../botpress";
import {TriviaContent} from "../content";
import {MaibPkiService} from "../services/MaibPkiService";
import {
    CurrencyCalculatedAmountState,
    ExchangeRateProvidersEnum,
    MainActionsEnum, MainFlowNodesEnum,
    RateVariationState,
    State,
    TodayRateState
} from "../types";

export class MainActions {

    private triviaContent: TriviaContent;
    private maibPkiService: MaibPkiService;

    constructor() {
        this.triviaContent = new TriviaContent();
        this.maibPkiService = new MaibPkiService();
    }

    @Action()
    [MainActionsEnum.RESET_STATE](state: State): State {
        return {
            ...state,
            operation: null,
            provider: null,
            providerName: null,
            todayRate: null,
            rateVariation: null,
            currencyAmount: null,
            input: null,
            isInputValid: false,
        }
    }

    @Action()
    [MainActionsEnum.VALIDATE_OPERATION](state: State, event: any): State {
        const choice = this.triviaContent.operations.choices.find(({text}) => event.text === text)
        let operation: MainFlowNodesEnum | null = null;

        if (choice) {
            operation = choice.value;
        }

        return {
            ...state,
            operation
        }
    }

    @Action()
    [MainActionsEnum.VALIDATE_PROVIDER](state: State, event: any): State {
        const choice = this.triviaContent.providers.choices.find(({text}) => event.text === text)
        let provider: ExchangeRateProvidersEnum | null = null;

        if (choice) {
            provider = choice.value;
        }

        return {
            ...state,
            provider,
            providerName: event.text
        }
    }

    @Action()
    async [MainActionsEnum.CALCULATE_TODAY_EXCHANGE_RATE](state: State): Promise<State> {
        const todayRate: TodayRateState = await this.maibPkiService.getTodayRates(state.provider!);

        return {
            ...state,
            todayRate
        }
    }

    @Action()
    async [MainActionsEnum.CALCULATE_EXCHANGE_RATE_VARIATION](state: State): Promise<State> {
        const rateVariation: RateVariationState = await this.maibPkiService.getRateVariation(state.provider!)

        return {
            ...state,
            rateVariation
        }
    }

    @Action()
    [MainActionsEnum.ASSIGN_INPUT_FOR_CALCULATE_EXCHANGE](state: State, event: any): State {
        let input: number | null = +event.text;
        let isInputValid: boolean = true

        if (!input) {
            input = null;
            isInputValid = false;
        }

        return {
            ...state,
            input,
            isInputValid
        }
    }

    @Action()
    async [MainActionsEnum.CALCULATE_EXCHANGE_BY_INPUT](state: State): Promise<State> {
        const currencyAmount: CurrencyCalculatedAmountState = await this.maibPkiService.getCurrencyCalculatedAmountState(state.provider!, state.input!)

        return {
            ...state,
            currencyAmount
        }
    }
}