export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

interface BackendErrorResponse {
  code?: string;
  message?: string;
  timestamp?: string;
}

interface ApiErrorOptions {
  status?: number;
  code: ApiErrorCode;
  backendCode?: string;
  backendMessage?: string;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code: ApiErrorCode;
  readonly backendCode?: string;
  readonly backendMessage?: string;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.backendCode = options.backendCode;
    this.backendMessage = options.backendMessage;
  }

  get isRateLimited() {
    return this.status === 429 || this.code === 'TOO_MANY_REQUESTS';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function toApiErrorCode(status: number, backendCode?: string): ApiErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      if (status >= 500) {
        return 'INTERNAL_SERVER_ERROR';
      }

      return isKnownApiErrorCode(backendCode) ? backendCode : 'UNKNOWN';
  }
}

function isKnownApiErrorCode(code: string | undefined): code is ApiErrorCode {
  return (
    code === 'BAD_REQUEST' ||
    code === 'UNAUTHORIZED' ||
    code === 'FORBIDDEN' ||
    code === 'NOT_FOUND' ||
    code === 'CONFLICT' ||
    code === 'TOO_MANY_REQUESTS' ||
    code === 'INTERNAL_SERVER_ERROR' ||
    code === 'NETWORK_ERROR' ||
    code === 'UNKNOWN'
  );
}

async function readBackendError(response: Response): Promise<BackendErrorResponse | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as BackendErrorResponse;
  } catch {
    return null;
  }
}

export async function createApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  const backendError = await readBackendError(response);
  const code = toApiErrorCode(response.status, backendError?.code);
  const message = backendError?.message || fallbackMessage;

  return new ApiError(message, {
    status: response.status,
    code,
    backendCode: backendError?.code,
    backendMessage: backendError?.message,
  });
}

export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  throw await createApiError(response, fallbackMessage);
}

export function toNetworkApiError(error: unknown, fallbackMessage: string): ApiError {
  if (isApiError(error)) {
    return error;
  }

  return new ApiError(error instanceof Error ? error.message : fallbackMessage, {
    code: 'NETWORK_ERROR',
  });
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isApiError(error) && error.isRateLimited) {
    return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
