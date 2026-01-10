import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, Shield } from 'lucide-react';

export const EmptyState = () => {
  const features = [
    {
      icon: Zap,
      title: 'Fast & Local',
      description: 'All processing happens on your machine',
    },
    {
      icon: Shield,
      title: 'Private',
      description: 'Your data never leaves your computer',
    },
    {
      icon: Sparkles,
      title: 'Open Source',
      description: 'Use any model from Ollama library',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative inline-block mb-6">
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20">
            <Bot className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 glow-text">Welcome to Ollama GUI</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          A beautiful interface for your local LLM models. Select a model and start chatting.
        </p>

        <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 rounded-xl gradient-border bg-card/50"
            >
              <feature.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
