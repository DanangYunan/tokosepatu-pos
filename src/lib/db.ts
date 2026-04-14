import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  size: string;
  sku: string;
  imageUrl?: string;
  createdAt: number;
}

export interface TransactionItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id?: number;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  timestamp: number;
  customerName?: string;
}

export interface User {
  id?: number;
  email: string;
  password?: string; // In real app, hash this
  name: string;
  role: 'admin' | 'customer';
  createdAt: number;
}

export class SoleFlowDB extends Dexie {
  products!: Table<Product>;
  transactions!: Table<Transaction>;
  users!: Table<User>;

  constructor() {
    super('SoleFlowDB');
    this.version(2).stores({
      products: '++id, name, brand, category, sku',
      transactions: '++id, timestamp, totalAmount',
      users: '++id, email, role'
    });
  }
}

export const db = new SoleFlowDB();

// Initial data for prototyping
export async function seedDatabase() {
  // Seed Products
  const productCount = await db.products.count();
  if (productCount === 0) {
    await db.products.bulkAdd([
      {
        name: 'Air Max 270',
        brand: 'Nike',
        category: 'Running',
        price: 1500000,
        stock: 10,
        size: '42',
        sku: 'NK-AM270-42',
        imageUrl: 'https://picsum.photos/seed/nike1/400/400',
        createdAt: Date.now()
      },
      {
        name: 'Ultraboost 22',
        brand: 'Adidas',
        category: 'Running',
        price: 1800000,
        stock: 15,
        size: '41',
        sku: 'AD-UB22-41',
        imageUrl: 'https://picsum.photos/seed/adidas1/400/400',
        createdAt: Date.now()
      },
      {
        name: 'Old Skool',
        brand: 'Vans',
        category: 'Casual',
        price: 800000,
        stock: 20,
        size: '40',
        sku: 'VN-OS-40',
        imageUrl: 'https://picsum.photos/seed/vans1/400/400',
        createdAt: Date.now()
      }
    ]);
  }

  // Seed Admin User
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.add({
      email: 'admin@soleflow.com',
      password: 'admin',
      name: 'Admin SoleFlow',
      role: 'admin',
      createdAt: Date.now()
    });
    // Add a default customer for testing
    await db.users.add({
      email: 'customer@gmail.com',
      password: 'user123',
      name: 'Budi Santoso',
      role: 'customer',
      createdAt: Date.now()
    });
  }
}
