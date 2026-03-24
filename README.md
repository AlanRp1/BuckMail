# 📧 BuckMail - Temporary Email Service

O **BuckMail** é um serviço de e-mail temporário com uma estética cyberpunk/gamer, feito para quem precisa proteger sua caixa de entrada real.

## 🚀 Como fazer o Deploy (Passo a Passo)

### 1. Backend (API)
1. Crie um novo projeto na **Vercel**.
2. Selecione a pasta `backend` como **Root Directory**.
3. Adicione as variáveis de ambiente:
   - `MONGO_URI`: Sua string de conexão do MongoDB Atlas.
   - `EMAIL_DOMAIN`: `buckmail.com` (ou seu domínio).
4. Deploy!

### 2. Frontend (Site)
1. Crie outro projeto na **Vercel**.
2. Selecione a pasta `frontend` como **Root Directory**.
3. Adicione a variável de ambiente:
   - `VITE_API_URL`: O link do backend que você acabou de criar.
4. Deploy!

## 🛠️ Tecnologias
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB, Socket.io.

---
Criado por **buck__ai** | [YouTube: BuckRP](https://youtube.com/@BuckRP) | [Discord](https://discord.gg/725uWvJ8U4)
