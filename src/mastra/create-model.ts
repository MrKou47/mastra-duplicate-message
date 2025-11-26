import { wrapLanguageModel, extractReasoningMiddleware } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type LLMConfig = {
  name: string;
  baseURL: string;
  apiKey: string;
  modelName: string;
}

export const glmConfig = {
  name: "GLM",
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  apiKey: "64d47735c04c4e5a8d1c97a751f0b691.HP8ZNJGw915Vj7lf",
  modelName: "GLM-4.6",
}

export function createModel(config: LLMConfig) {
  const modelProvider = createOpenAICompatible({
    name: config.name,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    supportsStructuredOutputs: true,
  });

  let model = modelProvider(config.modelName);

  if (String(config.modelName).toLowerCase().indexOf('glm') !== -1) {
    model = wrapLanguageModel({
      model: modelProvider(config.modelName),
      middleware: extractReasoningMiddleware({
        tagName: 'think',
      }),
    });
  }

  return model;
}