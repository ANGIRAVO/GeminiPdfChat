import { 
  users, type User, type InsertUser, 
  pdfs, type Pdf, type InsertPdf, 
  chats, type Chat, type InsertChat, 
  messages, type Message, type InsertMessage 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // PDF operations
  createPdf(pdf: InsertPdf): Promise<Pdf>;
  getPdfsByUser(userId: number): Promise<Pdf[]>;
  getPdf(id: number): Promise<Pdf | undefined>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByUser(userId: number): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChat(chatId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pdfs: Map<number, Pdf>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private pdfId: number;
  private chatId: number;
  private messageId: number;
  
  constructor() {
    this.users = new Map();
    this.pdfs = new Map();
    this.chats = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.pdfId = 1;
    this.chatId = 1;
    this.messageId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // PDF operations
  async createPdf(insertPdf: InsertPdf): Promise<Pdf> {
    const id = this.pdfId++;
    const pdf: Pdf = { 
      ...insertPdf, 
      id, 
      createdAt: new Date() 
    };
    this.pdfs.set(id, pdf);
    return pdf;
  }
  
  async getPdfsByUser(userId: number): Promise<Pdf[]> {
    return Array.from(this.pdfs.values()).filter(
      (pdf) => pdf.userId === userId,
    );
  }
  
  async getPdf(id: number): Promise<Pdf | undefined> {
    return this.pdfs.get(id);
  }
  
  // Chat operations
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.chatId++;
    // Create the chat object with the correct type
    const chat: Chat = { 
      id, 
      userId: insertChat.userId,
      title: insertChat.title,
      pdfId: insertChat.pdfId === undefined ? null : insertChat.pdfId,
      createdAt: new Date() 
    };
    this.chats.set(id, chat);
    return chat;
  }
  
  async getChatsByUser(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter((chat) => chat.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }
  
  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByChat(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

// Import PostgreSQL storage implementation
import { PostgresStorage } from "./db-storage";

// Create a storage instance based on environment
// If DATABASE_URL is present, use PostgreSQL storage, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemStorage();
