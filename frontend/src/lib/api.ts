// URL API
const API_URL = "http://localhost:3005"

// Общая функция для выполнения запросов
async function fetchAPI(endpoint: string, options: RequestInit = {}, isSpecial: boolean = false) {
  const url = `${API_URL}${endpoint}`
  const headers = new Headers(options.headers)

  if (!isSpecial) {
    headers.set("Content-Type", "application/json")
  }

  const req = {
    method: "GET",
    credentials: "include" as RequestCredentials,
    headers: headers,
    ...options,
  }

  const response = await fetch(url, req)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail[0].msg || data.detail || "Произошла ошибка при выполнении запроса")
  }

  return data
}

// API для аутентификации
export const loginAPI = {
  login: async (loginData: any) => {
    return fetchAPI("/login", {
      method: "POST",
      body: loginData,
    }, true)
  },
  logout: async () => {
    return fetchAPI("/logout", {
      method: "POST",
    })
  },
}

// API для работы с пользователями
export const usersAPI = {
  getUsers: async () => {
    return fetchAPI("/users", {
      method: "GET",
    })
  },
  getUser: async (id: number) => {
    return fetchAPI(`/users/${id}`, {
      method: "GET",
    })
  },
  createUser: async (userData: any) => {
    return fetchAPI("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },
  createAdmin: async (userData: any) => {
    return fetchAPI("/users/admin", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },
  blockUser: async (id: number) => {
    return fetchAPI(`/users/${id}`, {
      method: "POST",
    })
  },
  deleteUser: async (id: number) => {
    return fetchAPI(`/users/${id}`, {
      method: "DELETE",
    })
  },
}

// API для работы с категориями
export const categoriesAPI = {
  getCategories: async () => {
    return fetchAPI("/categories", {
      method: "GET",
    })
  },
  getCategory: async (id: number) => {
    return fetchAPI(`/categories/${id}`, {
      method: "GET",
    })
  },
  createCategory: async (categoryData: any) => {
    return fetchAPI("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    })
  },
  updateCategory: async (id: number, categoryData: any) => {
    return fetchAPI(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(categoryData),
    })
  },
  deleteCategory: async (id: number) => {
    return fetchAPI(`/categories/${id}`, {
      method: "DELETE",
    })
  },
}

// API для работы с тестами
export const testsAPI = {
  getTests: async () => {
    return fetchAPI("/tests", {
      method: "GET",
    })
  },
  getTest: async (id: number) => {
    return fetchAPI(`/tests/${id}`, {
      method: "GET",
    })
  },
  getTestAdmin: async (id: number) => {
    return fetchAPI(`/tests/admin/${id}`, {
      method: "GET",
    })
  },
  createTest: async (testData: any) => {
    return fetchAPI("/tests", {
      method: "POST",
      body: JSON.stringify(testData),
    })
  },
  updateTest: async (id: number, testData: any) => {
    return fetchAPI(`/tests/${id}`, {
      method: "POST",
      body: JSON.stringify(testData),
    })
  },
  deleteTest: async (id: number) => {
    return fetchAPI(`/tests/${id}`, {
      method: "DELETE",
    })
  },
}

// API для работы с результатами теста
export const resultsAPI = {
  getResults: async () => {
    return fetchAPI("/results", {
      method: "GET",
    })
  },
  getResultsTest: async (id: number) => {
    return fetchAPI(`/results/${id}`, {
      method: "GET",
    })
  },
  getResultsAdmin: async (id: number) => {
    return fetchAPI(`/results/admin/${id}`, {
      method: "GET",
    })
  },
  createResults: async (id: number, testData: any) => {
    return fetchAPI(`/results/${id}`, {
      method: "POST",
      body: JSON.stringify(testData),
    })
  },
}

// API для работы с рекомендациями
export const recommendAPI = {
  getTests: async () => {
    return fetchAPI("/recommend", {
      method: "GET",
    })
  },
}
