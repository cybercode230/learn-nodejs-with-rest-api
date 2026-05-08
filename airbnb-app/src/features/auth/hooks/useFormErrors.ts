import { useState } from 'react';

export const useFormErrors = () => {
  const [serverError, setServerError] = useState<string | null>(null);

  const clearError = () => {
    setServerError(null);
  };

  return {
    serverError,
    setServerError,
    clearError,
  };
};
