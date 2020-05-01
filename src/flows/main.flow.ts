import {v4} from 'uuid';
import {FlowNode, FlowStartNode, Next, OnEnter, OnReceive, Flow, Say} from "../botpress";
import {TextContent, TriviaContent} from "../content";
import {MainActionsEnum, MainFlowNodesEnum, State} from "../types";

@Flow()
export class MainFlow {
    @FlowStartNode()
    @OnEnter(Say(TextContent.GREETINGS))
    @Next(MainFlowNodesEnum.SHOW_OPERATIONS)
    [MainFlowNodesEnum.ENTRY]: string = v4();

    @FlowNode()
    @OnEnter(MainActionsEnum.RESET_STATE, Say(TriviaContent.OPERATIONS))
    @OnReceive(MainActionsEnum.VALIDATE_OPERATION)
    @Next(MainFlowNodesEnum.SHOW_PROVIDERS)
    [MainFlowNodesEnum.SHOW_OPERATIONS]: string = v4();

    @FlowNode()
    @OnEnter(Say(TriviaContent.PROVIDERS))
    @OnReceive(MainActionsEnum.VALIDATE_PROVIDER)
    @Next(state => state.operation === 'todayExchangeRate', MainFlowNodesEnum.TODAY_EXCHANGE_RATE)
    @Next(state => state.operation === 'exchangeRateVariation', MainFlowNodesEnum.EXCHANGE_RATE_VARIATION)
    @Next(state => state.operation === 'exchangeCalculator', MainFlowNodesEnum.ASK_INPUT_FOR_EXCHANGE_CALCULATOR)
    @Next(MainFlowNodesEnum.BAD_ANSWER)
    [MainFlowNodesEnum.SHOW_PROVIDERS]: string = v4();

    @FlowNode()
    @OnEnter(MainActionsEnum.CALCULATE_TODAY_EXCHANGE_RATE, Say(TextContent.TODAY_RATES))
    @Next(MainFlowNodesEnum.AWAIT)
    [MainFlowNodesEnum.TODAY_EXCHANGE_RATE]: string = v4();

    @FlowNode()
    @OnEnter(Say(TextContent.ASK_INPUT_FOR_EXCHANGE_CALCULATOR))
    @OnReceive(MainActionsEnum.ASSIGN_INPUT_FOR_CALCULATE_EXCHANGE)
    @Next((state: State) => state.isInputValid === true, MainFlowNodesEnum.EXCHANGE_CALCULATOR)
    @Next(MainFlowNodesEnum.INVALID_INPUT_FOR_EXCHANGE_CALCULATOR)
    [MainFlowNodesEnum.ASK_INPUT_FOR_EXCHANGE_CALCULATOR]: string = v4();

    @FlowNode()
    @OnEnter(Say(TextContent.INVALID_INPUT_FOR_EXCHANGE_CALCULATOR))
    @Next(MainFlowNodesEnum.ASK_INPUT_FOR_EXCHANGE_CALCULATOR)
    [MainFlowNodesEnum.INVALID_INPUT_FOR_EXCHANGE_CALCULATOR]: string = v4();

    @FlowNode()
    @OnEnter(MainActionsEnum.CALCULATE_EXCHANGE_BY_INPUT, Say(TextContent.EXCHANGE_CALCULATOR))
    @Next(MainFlowNodesEnum.AWAIT)
    [MainFlowNodesEnum.EXCHANGE_CALCULATOR]: string = v4();

    @FlowNode()
    @OnEnter(MainActionsEnum.CALCULATE_EXCHANGE_RATE_VARIATION, Say(TextContent.RATE_VARIATION))
    @Next(MainFlowNodesEnum.AWAIT)
    [MainFlowNodesEnum.EXCHANGE_RATE_VARIATION]: string = v4();

    @FlowNode()
    @OnEnter(Say(TextContent.GREETINGS))
    @Next(MainFlowNodesEnum.SHOW_OPERATIONS)
    [MainFlowNodesEnum.BAD_ANSWER]: string = v4();

    @FlowNode()
    @OnReceive(MainActionsEnum.RESET_STATE)
    @Next(MainFlowNodesEnum.SHOW_OPERATIONS)
    [MainFlowNodesEnum.AWAIT]: string = v4();
}
