# Ollama Local Connect

A modern, mobile-responsive web interface for managing Ollama AI models locally.

## 🚀 Features

- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **LocalStorage Management**: Automatic cleanup and error handling for storage limits
- **Multi-Model Support**: Create and manage conversations with different AI models
- **File Upload**: Attach images and documents to your conversations
- **Real-time Chat**: Streaming responses with typing indicators
- **Model Management**: Pull, list, and delete models directly from the interface

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: TanStack Query
- **Animations**: Framer Motion

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Ollama installed and running locally
- CORS enabled: `OLLAMA_ORIGINS=* ollama serve`

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd ollama-local-connect

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8081 in your browser
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

## 🚀 Deployment

### GitHub Actions (Recommended)

This project includes a GitHub Actions workflow that automatically deploys to your server at `192.168.1.108`.

1. **Set up GitHub Secrets**:
   - `SERVER_HOST`: `192.168.1.108`
   - `SERVER_USER`: Your SSH username
   - `SERVER_PORT`: SSH port (default: 22)
   - `SERVER_SSH_KEY`: Private SSH key for server access

2. **Push to trigger deployment**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

### Manual Deployment

```bash
# Build the application
npm run build

# Copy files to server
scp -r dist/* user@192.168.1.108:/var/www/html/

# Or use the deployment script
./scripts/deploy.sh
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OLLAMA_HOST=localhost
VITE_OLLAMA_PORT=11434
```

### Ollama Setup

1. **Install Ollama**: Visit [ollama.com](https://ollama.com) for installation instructions
2. **Start with CORS**: `OLLAMA_ORIGINS=* ollama serve`
3. **Pull a model**: `ollama pull llama2`

## 📱 Mobile Features

- **Collapsible Sidebar**: Hidden by default on mobile, accessible via hamburger menu
- **Touch-Optimized**: Larger buttons and touch-friendly interface
- **Sticky Headers**: Always accessible controls on mobile
- **Responsive Layout**: Adapts to any screen size

## 💾 Storage Management

The application includes robust localStorage management:

- **Automatic Cleanup**: Removes oldest conversations when storage is full
- **Size Limits**: Maximum 50 conversations, 100 messages per conversation
- **Graceful Degradation**: Continues working even if localStorage fails
- **Usage Monitoring**: Real-time storage usage tracking

## 🐛 Troubleshooting

### Connection Issues

If you see "Connection Failed":
1. Ensure Ollama is running: `ollama serve`
2. Check CORS is enabled: `OLLAMA_ORIGINS=* ollama serve`
3. Verify settings in Settings dialog
4. Check firewall settings

### Storage Issues

If you encounter storage errors:
- The application automatically handles quota exceeded errors
- Old conversations are automatically cleaned up
- You can manually clear storage in the Storage Test page

### Mobile Issues

- Ensure you're using a modern browser
- Check that touch events are not blocked
- Verify responsive design is working in browser dev tools

## 📁 Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.com) for the amazing local AI platform
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the [documentation](./DOCKER.md) for deployment help
- Visit the [Ollama documentation](https://github.com/jmorganca/ollama/blob/main/docs)

---

**Built with ❤️ using React and TypeScript**
