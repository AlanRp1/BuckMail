import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  RefreshCw, 
  Mail, 
  MailOpen, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Inbox,
  Check,
  ExternalLink,
  Github
} from 'lucide-react';

// Connect to Socket.io backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const App = () => {
  const [address, setAddress] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Notification sound
  const playSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play();
    } catch (err) {
      console.log('Audio error:', err);
    }
  };

  useEffect(() => {
    // Check localStorage for existing address
    const savedAddress = localStorage.getItem('buckmail_address');
    if (savedAddress) {
      setAddress(savedAddress);
      fetchMessages(savedAddress);
      socket.emit('join-inbox', savedAddress);
    } else {
      generateEmail();
    }

    // Socket listeners
    socket.on('new-email', (email) => {
      setMessages(prev => [email, ...prev]);
      playSound();
      setLastUpdated(new Date());
    });

    // Fallback Polling (Every 10 seconds) - Useful for Serverless hosting like Vercel
    const pollingInterval = setInterval(() => {
      const savedAddress = localStorage.getItem('buckmail_address');
      if (savedAddress) {
        fetchMessagesSilently(savedAddress);
      }
    }, 10000);

    return () => {
      socket.off('new-email');
      clearInterval(pollingInterval);
    };
  }, []);

  const fetchMessagesSilently = async (addr) => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/${addr}`);
      // Only update if there are new messages to avoid unnecessary re-renders
      setMessages(prev => {
        if (JSON.stringify(res.data) !== JSON.stringify(prev)) {
          if (res.data.length > prev.length) playSound();
          setLastUpdated(new Date());
          return res.data;
        }
        return prev;
      });
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const generateEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/generate`);
      const newAddress = res.data.address;
      setAddress(newAddress);
      localStorage.setItem('buckmail_address', newAddress);
      setMessages([]);
      setSelectedMessage(null);
      socket.emit('join-inbox', newAddress);
    } catch (err) {
      setError(err.response?.data?.error || 'Falha ao gerar e-mail');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (addr) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/messages/${addr}`);
      setMessages(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] selection:bg-neon-blue selection:text-dark-bg">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/20 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
        {/* Decorative Circuit Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 group">
              {/* Logo Mascot */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-lg shadow-neon-blue/20 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-white/20 flex items-center justify-center">
                <img 
                  src="https://cdn.discordapp.com/attachments/1388327970543763599/1485852411972030474/21a2f155-f436-4f6e-9a53-d4a0cc385460.png?ex=69c35f64&is=69c20de4&hm=fe76382d4b01cfe224a827c0cbcad327b688a373ca3ad2c781f5d64e171c798c&" 
                  alt="BuckMail Mascot" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="font-orbitron text-2xl font-black tracking-tighter">
              BUCK<span className="text-neon-blue">MAIL</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-neon-blue transition-colors">Como funciona</a>
            <a href="#" className="hover:text-neon-blue transition-colors">Privacidade</a>
            <a href="#" className="hover:text-neon-blue transition-colors">API</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/60 hover:text-white transition-colors">
              <Github size={20} />
            </button>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Status: Online
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Main Hero Section */}
          <section className="text-center space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-orbitron text-4xl md:text-6xl font-black uppercase tracking-tight"
            >
              Proteja sua <span className="neon-text-blue">Inbox</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/40 max-w-lg mx-auto"
            >
              E-mail temporário rápido, anônimo e seguro para gamers e desenvolvedores. Sem spam, sem rastreamento.
            </motion.p>
          </section>

          {/* Email Generator Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="cyber-card neon-border-blue relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"></div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  readOnly 
                  value={address} 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 font-orbitron text-lg tracking-wider text-neon-blue outline-none"
                  placeholder="Gerando endereço..."
                />
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all flex items-center gap-2"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  <span className="text-xs font-bold uppercase hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <button 
                onClick={generateEmail}
                disabled={loading}
                className="bg-neon-blue hover:bg-neon-blue/80 text-dark-bg font-orbitron font-bold uppercase px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Novo Endereço
              </button>
            </div>

            {error && <p className="mt-3 text-red-400 text-sm font-medium flex items-center gap-2"><ShieldCheck size={14} /> {error}</p>}
          </motion.div>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="cyber-card bg-white/5 border-white/5 flex items-start gap-4 p-4">
              <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue"><Zap size={20} /></div>
              <div>
                <h4 className="font-orbitron text-sm font-bold uppercase">Tempo Real</h4>
                <p className="text-xs text-white/40">Entrega instantânea via WebSockets.</p>
              </div>
            </div>
            <div className="cyber-card bg-white/5 border-white/5 flex items-start gap-4 p-4">
              <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple"><Clock size={20} /></div>
              <div>
                <h4 className="font-orbitron text-sm font-bold uppercase">Auto-Exclusão</h4>
                <p className="text-xs text-white/40">E-mails são deletados após 60 minutos.</p>
              </div>
            </div>
            <div className="cyber-card bg-white/5 border-white/5 flex items-start gap-4 p-4">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><ShieldCheck size={20} /></div>
              <div>
                <h4 className="font-orbitron text-sm font-bold uppercase">Privacidade</h4>
                <p className="text-xs text-white/40">Serviço anônimo, sem registros.</p>
              </div>
            </div>
          </section>

          {/* Inbox Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Inbox List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-lg font-bold flex items-center gap-2 uppercase tracking-wider">
                  <Inbox size={20} className="text-neon-purple" />
                  Caixa de Entrada
                </h3>
                <div className="text-[10px] text-white/30 font-mono uppercase">
                  Atualizado: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>

              <div className="cyber-card p-0 border-white/5 overflow-hidden h-[500px] flex flex-col">
                <div className="overflow-y-auto flex-1 divide-y divide-white/5">
                  <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 animate-pulse">
                          <Mail size={32} />
                        </div>
                        <p className="text-sm text-white/30 font-medium">Aguardando novas transmissões...</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.button
                          key={msg._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedMessage(msg)}
                          className={`w-full p-4 text-left transition-all hover:bg-white/5 flex gap-4 ${selectedMessage?._id === msg._id ? 'bg-white/5 border-l-2 border-neon-blue' : ''}`}
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${selectedMessage?._id === msg._id ? 'bg-neon-blue' : 'bg-neon-purple shadow-[0_0_5px_#7a00ff]'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="text-xs font-bold text-neon-blue truncate">{msg.from}</span>
                              <span className="text-[10px] text-white/30 font-mono">{formatTime(msg.receivedAt)}</span>
                            </div>
                            <div className="text-sm font-bold truncate mb-1">{msg.subject}</div>
                            <div className="text-xs text-white/40 truncate">{msg.bodyText?.substring(0, 60)}...</div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </AnimatePresence>
                </div>
                
                <button 
                  onClick={() => fetchMessages(address)}
                  className="p-3 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-center transition-colors border-t border-white/5"
                >
                  Forçar Atualização
                </button>
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-7">
              <div className="cyber-card p-0 border-white/5 overflow-hidden h-full flex flex-col min-h-[500px]">
                {selectedMessage ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col h-full"
                  >
                    {/* Message Header */}
                    <div className="p-6 border-b border-white/5 space-y-4 bg-white/[0.02]">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                        <button 
                          onClick={() => setSelectedMessage(null)}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/40"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="flex wrap gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">De</p>
                          <p className="text-neon-blue font-medium">{selectedMessage.from}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Data</p>
                          <p className="text-white/60 font-medium">{new Date(selectedMessage.receivedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Body */}
                    <div className="p-6 flex-1 overflow-y-auto bg-black/20">
                      <div 
                        className="prose prose-invert max-w-none text-white/80"
                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml || selectedMessage.bodyText }}
                      />
                    </div>
                    
                    {/* Message Footer */}
                    <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
                      <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-white/10 rounded hover:bg-white/5 transition-colors flex items-center gap-2">
                        Ver Original <ExternalLink size={12} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                      <MailOpen size={48} />
                    </div>
                    <div>
                      <h3 className="font-orbitron text-xl font-bold uppercase tracking-widest">Nenhuma Mensagem Selecionada</h3>
                      <p className="text-sm max-w-xs mx-auto mt-2">Selecione uma transmissão da caixa de entrada para descriptografar e visualizar seu conteúdo.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <h1 className="font-orbitron text-sm font-black tracking-tighter">
              BUCK<span className="text-neon-blue">MAIL</span>
            </h1>
            <span className="text-xs text-white/40">© 2026 BUCK-RP EDITION</span>
          </div>
          
          <div className="flex gap-8">
            <a href="https://youtube.com/@buck-rp?si=C_AmnxWi8u5TJg5X" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-neon-blue transition-colors">YouTube</a>
            <a href="https://discord.gg/86E9RvZ9Ya" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-neon-blue transition-colors">Discord</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-neon-blue transition-colors">Status</a>
          </div>
          
          <div className="text-[10px] font-mono text-white/20">
            BY: BUCK__AI // BUCK_SYS_v1.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
