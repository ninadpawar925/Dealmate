import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography,
  Card, CardContent, CardActions, IconButton, Avatar, Tooltip, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import apiClient from '../api';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

function BotResponseCard({ responseData }) {
  if (!responseData) return <ListItemText primary="Sorry, couldn't get product details." />;
  const { offers = [], ai_summary } = responseData;

  return (
    <Box sx={{ mt: 1 }}>
      {ai_summary && (
        <Typography variant="body1" sx={{ px: 1, mb: 1 }}>{ai_summary}</Typography>
      )}
      {offers.map((offer, index) => {
        const validLink = offer.link || `https://www.google.com/search?q=${encodeURIComponent(offer.title)}`;
        return (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>{offer.title}</Typography>
              <Typography variant="body2">₹{offer.price.toLocaleString()} — {offer.source}</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                variant="contained"
                href={validLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
}

function ChatbotPage() {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! Ask me about a product or upload an image.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isSpeechSupported) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/search', { query });
      setMessages(prev => [...prev, { sender: 'bot', data: response.data }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error getting product info.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      setMessages(prev => [...prev, { sender: 'user', text: '📷 Image uploaded.' }]);
      setIsLoading(true);
      try {
        const res = await apiClient.post('/search', { image: base64Data });
        setMessages(prev => [...prev, { sender: 'bot', data: res.data }]);
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error detecting image.' }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-container">
      <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/*" style={{ display: 'none' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 122px)' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ py: 1, px: 0, display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ ml: msg.sender === 'user' ? 1 : 0, mr: msg.sender === 'bot' ? 1 : 0, bgcolor: msg.sender === 'user' ? 'secondary.main' : 'primary.main' }}>
                  {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper sx={{ p: 1.5, maxWidth: '80%', bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper', color: msg.sender === 'user' ? 'white' : 'inherit', borderRadius: msg.sender === 'user' ? '20px 5px 20px 20px' : '5px 20px 20px 20px' }}>
                  {msg.data ? <BotResponseCard responseData={msg.data} /> : <ListItemText primary={msg.text} />}
                </Paper>
              </ListItem>
            ))}
            {isLoading && (
              <ListItem><CircularProgress size={24} /></ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tooltip title="Upload Image">
            <IconButton color="primary" onClick={() => imageInputRef.current?.click()}>
              <AddPhotoAlternateIcon />
            </IconButton>
          </Tooltip>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Ask about a product..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            sx={{ mx: 1 }}
          />
          <Tooltip title={isListening ? "Stop voice input" : "Start voice input"}>
            <IconButton color="primary" onClick={handleVoiceInput} disabled={isLoading}>
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          <Button type="submit" variant="contained" disabled={isLoading || !input.trim()}>
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default ChatbotPage;
