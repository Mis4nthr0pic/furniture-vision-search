export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ImageInput {
  base64: string;
  mimeType: string;
}

export interface LLMClient {
  vision(args: {
    imageBase64: string;
    mimeType: string;
    systemPrompt: string;
    userPrompt?: string;
  }): Promise<unknown>;

  embed(args: { input: string | string[] }): Promise<number[][]>;

  chat(args: {
    messages: ChatMessage[];
    images?: ImageInput[];
    jsonMode?: boolean;
  }): Promise<string>;
}
