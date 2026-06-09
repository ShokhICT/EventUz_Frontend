export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const apiFetch = async (endpoint, options = {}) => {
    const headers = { ...options.headers }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    try {
      const response = await $fetch(`${config.public.apiBase}${endpoint}`, {
        ...options,
        headers
      })
      return response
    } catch (error) {
      // Handle 401 - token expired
      if (error.statusCode === 401 && error.data?.code === 'TOKEN_EXPIRED') {
        const refreshed = await authStore.refreshToken()
        if (refreshed) {
          headers.Authorization = `Bearer ${authStore.token}`
          return await $fetch(`${config.public.apiBase}${endpoint}`, {
            ...options,
            headers
          })
        }
      }
      throw error
    }
  }

  const get = (endpoint, params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value)
      }
    })
    const queryStr = query.toString()
    const url = queryStr ? `${endpoint}?${queryStr}` : endpoint
    return apiFetch(url)
  }

  const post = (endpoint, body, options = {}) => {
    return apiFetch(endpoint, {
      method: 'POST',
      body,
      ...options
    })
  }

  const put = (endpoint, body) => {
    return apiFetch(endpoint, {
      method: 'PUT',
      body
    })
  }

  const del = (endpoint) => {
    return apiFetch(endpoint, {
      method: 'DELETE'
    })
  }

  // For file uploads (FormData)
  const upload = (endpoint, formData, method = 'POST') => {
    return apiFetch(endpoint, {
      method,
      body: formData
    })
  }

  return { get, post, put, del, upload, apiFetch }
}
