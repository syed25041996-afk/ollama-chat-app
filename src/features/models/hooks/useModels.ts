import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ollamaApi } from '@/lib/api/ollama';
import useSettingsStore from '@/stores/settings';
import { OllamaModel, OllamaModelListResponse, PullProgress } from '../types';

export const useListModels = () => {
  const { settings } = useSettingsStore();

  return useQuery({
    queryKey: ['models', settings],
    queryFn: () => ollamaApi.listModels(settings),
    enabled: !!settings.host && !!settings.port,
  });
};

export const useCheckConnection = () => {
  const { settings } = useSettingsStore();

  return useQuery({
    queryKey: ['connection', settings],
    queryFn: () => ollamaApi.checkConnection(settings),
    enabled: !!settings.host && !!settings.port,
    refetchInterval: 30000, // Check every 30 seconds
  });
};

export const useDeleteModel = () => {
  const { settings } = useSettingsStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelName: string) => ollamaApi.deleteModel(settings, modelName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const usePullModel = () => {
  const { settings } = useSettingsStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelName: string) => {
      const progressUpdates: PullProgress[] = [];
      for await (const progress of ollamaApi.pullModel(settings, modelName)) {
        progressUpdates.push(progress);
      }
      return progressUpdates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};