import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  tags: string[];
  lang: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  tags: string[];
  lang?: string;
}

export interface UpdateFAQData {
  question?: string;
  answer?: string;
  tags?: string[];
  lang?: string;
}

export interface AskRequest {
  text: string;
  lang?: string;
}

export interface FAQResult {
  id: number;
  question: string;
  answer: string;
  tags: string[];
  score: number;
}

export interface AskResponse {
  results: FAQResult[];
  ambiguous?: boolean;
  message?: string;
}

export const faqAPI = {
  // CRUD operations
  getAll: async (lang?: string): Promise<FAQ[]> => {
    const response = await api.get('/faqs', { params: { lang } });
    return response.data;
  },

  getById: async (id: number): Promise<FAQ> => {
    const response = await api.get(`/faqs/${id}`);
    return response.data;
  },

  create: async (data: CreateFAQData): Promise<FAQ> => {
    const response = await api.post('/faqs', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFAQData): Promise<FAQ> => {
    const response = await api.patch(`/faqs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/faqs/${id}`);
  },

  // Ask endpoint
  ask: async (data: AskRequest): Promise<AskResponse> => {
    const response = await api.post('/faqs/ask', data);
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  checkDb: async () => {
    const response = await api.get('/health/db');
    return response.data;
  },
};

export default api;