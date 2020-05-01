export interface TriviaContentFormData<T = string> {
    question: string;
    choices: {text: string; value: T}[];
    typing?: boolean;
}