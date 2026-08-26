import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Extracts a clean, human-readable error message from Django REST Framework (DRF) error payloads.
 * Handles:
 * - Direct strings: { "detail": "..." } or { "error": "..." } or { "message": "..." }
 * - Field-level errors: { "username": ["A user with that username already exists."], "email": ["..."] }
 * - Non-field errors: { "non_field_errors": ["..."] }
 * - Array of errors: ["..."]
 */
export function extractApiErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!error) return fallbackMessage;

  const data = error.response?.data;
  if (!data) {
    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
    return fallbackMessage;
  }

  // 1. Direct string fields
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;

  // 2. Array of strings
  if (Array.isArray(data)) {
    return data.filter(item => typeof item === 'string').join(' ');
  }

  // 3. Object with field errors
  if (typeof data === 'object' && data !== null) {
    const errorMessages: string[] = [];

    for (const [field, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        const text = value.join(' ');
        if (field === 'non_field_errors' || field === 'detail' || field === 'error') {
          errorMessages.push(text);
        } else {
          errorMessages.push(`${capitalizeField(field)}: ${text}`);
        }
      } else if (typeof value === 'string') {
        if (field === 'non_field_errors' || field === 'detail' || field === 'error') {
          errorMessages.push(value);
        } else {
          errorMessages.push(`${capitalizeField(field)}: ${value}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        errorMessages.push(`${capitalizeField(field)}: ${JSON.stringify(value)}`);
      }
    }

    if (errorMessages.length > 0) {
      return errorMessages.join(' | ');
    }
  }

  return fallbackMessage;
}

/**
 * Attaches field-level DRF errors directly to React Hook Form inputs and sets the root error.
 */
export function applyApiErrorsToForm<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>,
  fallbackMessage: string = 'An error occurred. Please check the form.'
) {
  const data = error?.response?.data;

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    let hasFieldErrors = false;

    for (const [field, value] of Object.entries(data)) {
      if (field === 'non_field_errors' || field === 'detail' || field === 'error') {
        const msg = Array.isArray(value) ? value.join(' ') : String(value);
        setError('root' as Path<T>, { message: msg });
        hasFieldErrors = true;
      } else {
        const msg = Array.isArray(value) ? value.join(' ') : String(value);
        setError(field as Path<T>, { message: msg });
        hasFieldErrors = true;
      }
    }

    if (!hasFieldErrors) {
      setError('root' as Path<T>, { message: fallbackMessage });
    }
  } else {
    const generalMsg = extractApiErrorMessage(error, fallbackMessage);
    setError('root' as Path<T>, { message: generalMsg });
  }
}

function capitalizeField(field: string): string {
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
