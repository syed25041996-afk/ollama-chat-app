import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useCheckConnection } from '../hooks/useModels';

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

export const ConnectionStatusComponent = () => {
  const { data: isConnected, isLoading, refetch } = useCheckConnection();

  const status: ConnectionStatus = isLoading ? 'checking' : isConnected ? 'connected' : 'disconnected';

  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Connected',
      className: 'text-success',
      dotClassName: 'bg-success',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      className: 'text-destructive',
      dotClassName: 'bg-destructive',
    },
    checking: {
      icon: Loader2,
      text: 'Checking...',
      className: 'text-muted-foreground',
      dotClassName: 'bg-muted-foreground',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.button
      onClick={() => refetch()}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-secondary/50 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          className={`absolute inline-flex h-full w-full rounded-full ${config.dotClassName} opacity-75`}
          animate={status === 'connected' ? { scale: [1, 1.5, 1], opacity: [0.75, 0.25, 0.75] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClassName}`} />
      </span>
      <Icon className={`w-4 h-4 ${config.className} ${status === 'checking' ? 'animate-spin' : ''}`} />
      <span className="text-sm font-medium">{config.text}</span>
    </motion.button>
  );
};