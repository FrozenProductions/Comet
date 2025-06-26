export interface Script {
    name: string;
    content: string;
}

export interface ExecutionResponse {
    success: boolean;
    output?: string;
    error?: string;
}
