type KnownApiError = {
  data?: {
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const apiError = error as KnownApiError;
  if (apiError?.data?.message) {
    return apiError.data.message;
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return fallback;
};
