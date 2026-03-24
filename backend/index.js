require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const Email = require('./models/Email');
const Address = require('./models/Address');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const generateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100, // Increased to 100 for better user experience
  message: { error: 'Limite de geração atingido. Você só pode criar 100 e-mails por dia.' }
});

const { MongoMemoryServer } = require('mongodb-memory-server');

// MongoDB Connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // If no URI is provided or if it's the default localhost one and mongo isn't running
    if (!uri || uri.includes('localhost')) {
      console.log('Using MongoDB Memory Server for local testing...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDB();

// Domain for the emails (BuckMail.com)
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'buckmail.com';

// Routes

// 1. Generate a new temporary email
app.post('/api/generate', generateLimiter, async (req, res) => {
  try {
    const ip = req.ip;
    
    // Lista de nomes para gerar e-mails mais amigáveis
    const names = ['lucas', 'pedro', 'gabriel', 'mateus', 'felipe', 'thiago', 'bruno', 'vitor', 'enzo', 'arthur', 'rafael', 'caio', 'vinicius', 'buck', 'hacker', 'gamer'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 dígitos aleatórios
    
    const addressStr = `${randomName}${randomNum}@${EMAIL_DOMAIN}`;
    
    const newAddress = new Address({
      address: addressStr,
      ip: ip
    });
    
    await newAddress.save();
    res.json({ address: addressStr });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// 2. Get messages for a specific address
app.get('/api/messages/:address', apiLimiter, async (req, res) => {
  try {
    const { address } = req.params;
    const messages = await Email.find({ to: address.toLowerCase() }).sort({ receivedAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. Webhook to receive emails (Mailgun structure example)
app.post('/api/webhook/receive', async (req, res) => {
  console.log('Webhook request received:', req.body);
  try {
    // Basic Mailgun/Sendgrid webhook processing
    // Mailgun POSTs data as form-data or JSON
    const { sender, recipient, subject, 'body-html': bodyHtml, 'body-plain': bodyText } = req.body;
    
    if (!recipient) {
      console.log('Webhook error: No recipient in request body');
      return res.status(400).send('No recipient');
    }

    // Validate if the recipient exists in our system
    const addressExists = await Address.findOne({ address: recipient.toLowerCase() });
    
    if (addressExists) {
      const newEmail = new Email({
        to: recipient.toLowerCase(),
        from: sender || 'Desconhecido',
        subject: subject || '(Sem Assunto)',
        bodyHtml: bodyHtml || bodyText,
        bodyText: bodyText || bodyHtml
      });
      
      await newEmail.save();
      
      // Notify client via Socket.io
      io.to(recipient.toLowerCase()).emit('new-email', newEmail);
      
      console.log(`New email received for ${recipient}`);
    } else {
      console.log(`Webhook ignored: Recipient ${recipient} not found in database`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing email');
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins a room named after their temporary email address
  socket.on('join-inbox', (address) => {
    if (address) {
      socket.join(address.toLowerCase());
      console.log(`Socket ${socket.id} joined room: ${address}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
