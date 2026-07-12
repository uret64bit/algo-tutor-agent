import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  getProfile: () => api.get('/auth/me'),
}

export const knowledgeApi = {
  getTree: () => api.get('/knowledge/tree'),
  getById: (id: number) => api.get(`/knowledge/${id}`),
  getLectures: (id: number) => api.get(`/knowledge/${id}/lectures`),
}

export const problemsApi = {
  list: (params?: {
    page?: number
    page_size?: number
    difficulty?: number
    knowledge_point?: number
    search?: string
  }) => api.get('/problems', { params }),
  getById: (id: number) => api.get(`/problems/${id}`),
  submit: (id: number, code: string, language: string) =>
    api.post(`/problems/${id}/submit`, { code, language }),
  getHints: (id: number, level: number) => api.get(`/problems/${id}/hints`, { params: { level } }),
  getSubmissions: (id: number) => api.get(`/problems/${id}/submissions`),
}

export const ragApi = {
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post('/rag/chat', { message, history }),
}

export const progressApi = {
  getOverview: () => api.get('/progress/overview'),
  getWrongAnswers: () => api.get('/progress/wrong-answers'),
}

export const reviewApi = {
  getList: () => api.get('/review/list'),
  submitReview: (id: number, correct: boolean) => api.post(`/review/${id}/submit`, { correct }),
}

export const notificationApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}

export const discussionApi = {
  getSolutions: (problemId: number) => api.get(`/problems/${problemId}/solutions`),
  getSolutionById: (id: number) => api.get(`/solutions/${id}`),
  createSolution: (problemId: number, data: { title: string; content: string; language: string }) =>
    api.post(`/problems/${problemId}/solutions`, data),
  likeSolution: (id: number) => api.post(`/solutions/${id}/like`),
  getComments: (solutionId: number) => api.get(`/solutions/${solutionId}/comments`),
  createComment: (solutionId: number, content: string) =>
    api.post(`/solutions/${solutionId}/comments`, { content }),
}
