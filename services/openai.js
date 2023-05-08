import axios from 'axios';  
import FormData from 'form-data';  
import config from '../config/index.js';  
import { handleFulfilled, handleRejected, handleRequest } from './utils/index.js';  
  
export const ROLE_SYSTEM = 'system';  
export const ROLE_AI = 'assistant';  
export const ROLE_HUMAN = 'user';  
  
export const FINISH_REASON_STOP = 'stop';  
export const FINISH_REASON_LENGTH = 'length';  
  
export const IMAGE_SIZE_256 = '256x256';  
export const IMAGE_SIZE_512 = '512x512';  
export const IMAGE_SIZE_1024 = '1024x1024';  
  
export const MODEL_GPT_3_5_TURBO = 'gpt-35-turbo';  
export const MODEL_WHISPER_1 = 'whisper-1';  
  
const client = axios.create({  
  baseURL: 'https://chibot.openai.azure.com/',  
  timeout: config.OPENAI_TIMEOUT,  
  headers: {  
    'Accept-Encoding': 'gzip, deflate, compress',  
    'Ocp-Apim-Subscription-Key': config.OPENAI_API_KEY,  
    'Content-Type': 'application/json',  
  },  
});  
  
client.interceptors.request.use((c) => {  
  return handleRequest(c);  
});  
  
client.interceptors.response.use(handleFulfilled, (err) => {  
  if (err.response?.data?.error?.message) {  
    err.message = err.response.data.error.message;  
  }  
  return handleRejected(err);  
});  
  
const createChatCompletion = ({  
  model = MODEL_GPT_3_5_TURBO,  
  messages,  
  temperature = 0.7,  
  maxTokens = 800,  
  frequencyPenalty = 0,  
  presencePenalty = 0,  
  stop = null,  
}) => client.post('/openai/v1/generations', {  
  model,  
  messages,  
  temperature,  
  max_tokens: maxTokens,  
  frequency_penalty: frequencyPenalty,  
  presence_penalty: presencePenalty,  
  stop,  
});  
  
export {  
  createChatCompletion,  
};  
