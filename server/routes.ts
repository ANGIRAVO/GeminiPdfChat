import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPdfSchema, 
  insertChatSchema, 
  insertMessageSchema 
} from "@shared/schema";
import { z } from "zod";
import * as crypto from "crypto";
import session from "express-session";
import MemoryStore from "memorystore";
import bodyParser from "body-parser";

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session configuration
  const SessionStore = MemoryStore(session);
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'yoursecretkey'
  }));
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // AUTH ROUTES
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = hashPassword(userData.password);
      
      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Set user session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });
  
  app.get('/api/auth/user', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // PDF ROUTES
  app.post('/api/pdfs', isAuthenticated, async (req, res) => {
    try {
      // Parse JSON from request body
      const pdfData = insertPdfSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const newPdf = await storage.createPdf(pdfData);
      res.status(201).json(newPdf);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid PDF data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create PDF" });
      }
    }
  });
  
  app.get('/api/pdfs', isAuthenticated, async (req, res) => {
    try {
      const pdfs = await storage.getPdfsByUser(req.session.userId!);
      res.status(200).json(pdfs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get PDFs" });
    }
  });
  
  // CHAT ROUTES
  app.post('/api/chats', isAuthenticated, async (req, res) => {
    try {
      const chatData = insertChatSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const newChat = await storage.createChat(chatData);
      res.status(201).json(newChat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid chat data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create chat" });
      }
    }
  });
  
  app.get('/api/chats', isAuthenticated, async (req, res) => {
    try {
      const chats = await storage.getChatsByUser(req.session.userId!);
      res.status(200).json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chats" });
    }
  });
  
  app.get('/api/chats/:id', isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      // Check if the chat belongs to the authenticated user
      if (chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat" });
    }
  });
  
  // MESSAGE ROUTES
  app.post('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Check if the chat exists and belongs to the user
      const chat = await storage.getChat(messageData.chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      if (chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });
  
  app.get('/api/chats/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      
      // Check if the chat exists and belongs to the user
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      if (chat.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const messages = await storage.getMessagesByChat(chatId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  
  // GEMINI API PROXY
  app.post('/api/gemini', isAuthenticated, async (req, res) => {
    try {
      const { pdfContent, message } = req.body;
      
      if (!pdfContent || !message) {
        return res.status(400).json({ 
          message: "PDF content and message are required" 
        });
      }
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Gemini API key is not configured" });
      }
      
      // Import Google Generative AI library
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      
      try {
        // Initialize the Gemini API client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Prepare the prompt with context
        const prompt = `You are a helpful assistant that answers questions about PDF documents.
                  
PDF CONTENT:
${pdfContent}

USER QUESTION:
${message}

Please provide a detailed, accurate, and helpful response based on the PDF content above.`;
        
        // Generate content using the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        // Return the AI response
        res.status(200).json({
          response: aiResponse
        });
      } catch (genError) {
        console.error('Gemini API error:', genError);
        return res.status(404).json({ 
          message: "Failed to get response from Gemini API. Please make sure your API key is correct and try again."
        });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ message: "Failed to process your request" });
    }
  });

  return httpServer;
}
