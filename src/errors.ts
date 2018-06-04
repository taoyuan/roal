export interface RemError {
  code: number;
  message: string;
  data?: any;
}

export const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  INVALID_SIGNAL: -32604
};

export const ErrorMessages = {
  [ErrorCodes.PARSE_ERROR]: 'Parse Error',
  [ErrorCodes.INVALID_REQUEST]: 'Invalid request',
  [ErrorCodes.METHOD_NOT_FOUND]: 'Method not found',
  [ErrorCodes.INVALID_PARAMS]: 'Invalid method parameter(s)',
  [ErrorCodes.INTERNAL_ERROR]: 'Internal error',
  [ErrorCodes.INVALID_SIGNAL]: 'Invalid signal',
};

export function createError(code?: number, message?: string, data?: any): RemError {
  if (typeof(code) !== 'number') {
    code = ErrorCodes.INTERNAL_ERROR;
  }

  if (typeof(message) !== 'string') {
    message = ErrorMessages[code] || '';
  }

  const error: RemError = {code: code, message: message};
  if (typeof(data) !== 'undefined') {
    error.data = data;
  }
  return error;
}
