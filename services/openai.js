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

export const MODEL_GPT_3_5_TURBO = 'gpt-3.5-turbo';
export const MODEL_WHISPER_1 = 'whisper-1';

const client = axios.create({
  baseURL: 'https://chirueai.openai.azure.com',
  timeout: config.AZURE_OPENAI_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
    'Ocp-Apim-Subscription-Key': config.AZURE_OPENAI_API_KEY,
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
  
export const MODEL_GPT_3_5_TURBO = 'gpt-3.5-turbo';  
export const MODEL_WHISPER_1 = 'whisper-1';  
  
const client = axios.create({  
  baseURL: 'https://api.cognitive.microsoft.com/azure/cognitiveservices/vision/v3.0/',  
  timeout: config.AZURE_OPENAI_TIMEOUT,  
  headers: {  
    'Accept-Encoding': 'gzip, deflate, compress',  
    'Ocp-Apim-Subscription-Key': config.AZURE_OPENAI_API_KEY,  
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
  model = config.AZURE_OPENAI_COMPLETION_MODEL,  
  messages,  
  temperature = config.AZURE_OPENAI_COMPLETION_TEMPERATURE,  
  maxTokens = config.AZURE_OPENAI_COMPLETION_MAX_TOKENS,  
  frequencyPenalty = config.AZURE_OPENAI_COMPLETION_FREQUENCY_PENALTY,  
  presencePenalty = config.AZURE_OPENAI_COMPLETION_PRESENCE_PENALTY,  
}) => client.post('/chat', {  
  prompt: messages.join('\n'),  
  temperature,  
  max_tokens: maxTokens,  
  frequency_penalty: frequencyPenalty,  
  presence_penalty: presencePenalty,  
});  
  
const createTextCompletion = ({  
  model = config.AZURE_OPENAI_COMPLETION_MODEL,  
  prompt,  
  temperature = config.AZURE_OPENAI_COMPLETION_TEMPERATURE,  
  maxTokens = config.AZURE_OPENAI_COMPLETION_MAX_TOKENS,  
  frequencyPenalty = config.AZURE_OPENAI_COMPLETION_FREQUENCY_PENALTY,  
  presencePenalty = config.AZURE_OPENAI_COMPLETION_PRESENCE_PENALTY,  
  stop = [  
    ` ${ROLE_AI}:`,  
    ` ${ROLE_HUMAN}:`,  
  ],  
}) => client.post('/comprehend/analyze', {  
  language: 'en',  
  text: prompt,  
  model,  
  temperature,  
  max_tokens: maxTokens,  
  frequency_penalty: frequencyPenalty,  
  presence_penalty: presencePenalty,  
});  

const createImage = ({
  prompt,
  n = 1,
  size = IMAGE_SIZE_256,
}) => client.post('/v1/images/generations', {
  prompt,
  n,
  size,
});

const createAudioTranscriptions = ({
  buffer,
  file,
  model = MODEL_WHISPER_1,
}) => {
  const formData = new FormData();
  formData.append('file', buffer, file);
  formData.append('model', model);
  return client.post('/v1/audio/transcriptions', formData.getBuffer(), {
    headers: formData.getHeaders(),
  });
};

export {
  createChatCompletion,
  createTextCompletion,
  createImage,
  createAudioTranscriptions,
};
