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
  baseURL: 'https://api.openai.com',
  timeout: config.OPENAI_TIMEOUT,
  headers: {
    'Accept-Encoding': 'gzip, deflate, compress',
  },
});

client.interceptors.request.use((c) => {
  c.headers.Authorization = `Bearer ${config.OPENAI_API_KEY}`;
  return handleRequest(c);
});

client.interceptors.response.use(handleFulfilled, (err) => {
  if (err.response?.data?.error?.message) {
    err.message = err.response.data.error.message;
  }
  return handleRejected(err);
});

const createChatCompletion = ({    
  model = config.OPENAI_COMPLETION_MODEL,    
  messages,    
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,    
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,    
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,    
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,    
  stop = [    
    ` ${ROLE_AI}:`,    
    ` ${ROLE_HUMAN}:`,    
  ],    
  apiType = 'azure',  
  apiBase = 'https://chibot.openai.azure.com/',  
  apiVersion = '2023-03-15-preview',  
  apiKey = config.OPENAI_API_KEY,  
}) => {  
  openai.api_type = apiType;  
  openai.api_base = apiBase;  
  openai.api_version = apiVersion;  
  openai.api_key = apiKey;  
  
  return openai.Completion.create({  
    engine: model,  
    prompt: messages.join(''),  
    temperature,  
    max_tokens: maxTokens,  
    top_p: 0.95,  
    frequency_penalty: frequencyPenalty,  
    presence_penalty: presencePenalty,  
    stop,  
  });  
};  

const response = await createChatCompletion({  
  model: 'gpt-35-turbo',  
  messages: [{"role":"system","content":"你是一個幫助人們尋找資訊的AI助手。"}],  
  temperature: 0.7,  
  maxTokens: 2500,  
  frequencyPenalty: 0,  
  presencePenalty: 0,  
  stop: null,  
  apiType: 'azure',  
  apiBase: 'https://chibot.openai.azure.com/',  
  apiVersion: '2023-03-15-preview',  
  apiKey: process.env.OPENAI_API_KEY,  
});  



const createTextCompletion = ({
  model = config.OPENAI_COMPLETION_MODEL,
  prompt,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
  stop = [
    ` ${ROLE_AI}:`,
    ` ${ROLE_HUMAN}:`,
  ],
}) => client.post('/v1/completions', {
  model,
  prompt,
  temperature,
  max_tokens: maxTokens,
  frequency_penalty: frequencyPenalty,
  presence_penalty: presencePenalty,
  stop,
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
