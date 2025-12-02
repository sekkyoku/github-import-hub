# Visionary | StreamVision Media

An AI-powered document query interface that connects to your n8n workflow for intelligent information retrieval from your Supabase file database.

## 🚀 Features

- **AI-Powered Queries**: Ask natural language questions about your documents
- **Real-time Responses**: Get instant answers from your knowledge base
- **Beautiful UI**: Modern, responsive interface with StreamVision Media branding
- **Conversation History**: Keep track of your chat sessions
- **N8N Integration**: Seamlessly connects to your existing n8n workflow

## 🛠️ Setup Instructions

### 1. Configure N8N Webhook

1. Open your n8n workflow
2. Copy your webhook URL
3. Create a `.env` file in the project root:

```bash
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📡 N8N Workflow Requirements

Your n8n workflow should:

- Accept POST requests with the following structure:
```json
{
  "query": "user's question",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

- Return responses in one of these formats:
```json
{
  "response": "AI response text"
}
// OR
{
  "message": "AI response text"
}
// OR
{
  "result": "AI response text"
}
```

## 🎨 Customization

The app uses StreamVision Media's professional color palette with navy blue and coral tones. All colors are defined in `src/index.css` using CSS variables for easy customization.

## 📦 Deployment

Deploy with one click using the Lovable platform:

1. Click **Publish** in the top right
2. Your app will be deployed to production
3. Optional: Connect your custom domain in Settings

## 🔧 Tech Stack

- **React** + **TypeScript**: Frontend framework
- **Tailwind CSS**: Styling with custom design system
- **shadcn/ui**: Beautiful, accessible UI components
- **N8N**: Workflow automation and AI integration
- **Vite**: Fast build tool and dev server

## 📄 License

© 2025 StreamVision Media. All rights reserved.
