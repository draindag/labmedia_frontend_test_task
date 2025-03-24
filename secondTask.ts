import { ref } from 'vue';

interface HttpRequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}


// Composable для выполнения HTTP запросов
export function useHttp<T = any>() {
  const data = ref<T | null>(null);
  const error = ref<any>(null);
  const loading = ref<boolean>(false);
  const success = ref<boolean>(false);
  const status = ref<number | null>(null);

  
  // Функция для отправки HTTP запроса
  const sendRequest = async (options: HttpRequestOptions): Promise<void> => {
    loading.value = true;
    error.value = null;
    success.value = false;

    try {
      const response = await fetch(options.url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      status.value = response.status;
      const responseData = await response.json();

      if (!response.ok) {
        error.value = responseData;
      } else {
        data.value = responseData;
        success.value = true;
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,       // реактивное состояние данных ответа
    error,      // реактивное состояние ошибки
    loading,    // реактивное состояние загрузки
    success,    // реактивное состояние успешного выполнения запроса
    status,     // HTTP статус ответа
    sendRequest // функция для отправки запроса
  };
}
