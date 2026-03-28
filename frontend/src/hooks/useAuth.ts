import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { setTokens, clearAuth, getStoredUser, getRefreshToken } from '../utils/auth';
import { LoginInput, RegisterInput, User } from '../types/api';

export const useCurrentUser = (): User | null => getStoredUser();

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken, data.user);
      queryClient.clear();
      navigate('/dashboard');
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (error: unknown) => {
      const msg = getErrorMessage(error);
      toast.error(msg);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken, data.user);
      navigate('/dashboard');
      toast.success(`Welcome, ${data.user.name}!`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
};

const getErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error
  ) {
    const axiosErr = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosErr.response?.data?.error?.message ?? 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
