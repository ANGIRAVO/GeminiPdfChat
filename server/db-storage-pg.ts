import { db } from "./db-pg";
import { eq } from "drizzle-orm";
import { 
  users, type User, type InsertUser, 
  pdfs, type Pdf, type InsertPdf, 
  chats, type Chat, type InsertChat, 
  messages, type Message, type InsertMessage 
} from "@shared/schema";
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const inserted = await db.insert(users).values(user).returning();
    return inserted[0];
  }
  
  // PDF operations
  async createPdf(pdf: InsertPdf): Promise<Pdf> {
    const inserted = await db.insert(pdfs).values(pdf).returning();
    return inserted[0];
  }
  
  async getPdfsByUser(userId: number): Promise<Pdf[]> {
    return await db.select().from(pdfs).where(eq(pdfs.userId, userId));
  }
  
  async getPdf(id: number): Promise<Pdf | undefined> {
    const results = await db.select().from(pdfs).where(eq(pdfs.id, id));
    return results[0];
  }
  
  // Chat operations
  async createChat(chat: InsertChat): Promise<Chat> {
    const inserted = await db.insert(chats).values(chat).returning();
    return inserted[0];
  }
  
  async getChatsByUser(userId: number): Promise<Chat[]> {
    return await db.select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(chats.createdAt);
  }
  
  async getChat(id: number): Promise<Chat | undefined> {
    const results = await db.select().from(chats).where(eq(chats.id, id));
    return results[0];
  }
  
  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const inserted = await db.insert(messages).values(message).returning();
    return inserted[0];
  }
  
  async getMessagesByChat(chatId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }
}