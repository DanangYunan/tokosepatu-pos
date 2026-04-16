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
        name: 'Nike Air Max 270 React',
        brand: 'Nike',
        category: 'Running',
        price: 1850000,
        stock: 12,
        size: '42',
        sku: 'NK-AM270-RD',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
        createdAt: Date.now()
      },
      {
        name: 'Adidas Ultraboost 22 Black',
        brand: 'Adidas',
        category: 'Running',
        price: 2400000,
        stock: 8,
        size: '43',
        sku: 'AD-UB22-BK',
        imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1000',
        createdAt: Date.now()
      },
      {
        name: 'Vans Old Skool Classic',
        brand: 'Vans',
        category: 'Casual',
        price: 950000,
        stock: 25,
        size: '40',
        sku: 'VN-OS-CL',
        imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=1000',
        createdAt: Date.now()
      },
      {
        name: 'Air Jordan 1 Retro High',
        brand: 'Nike',
        category: 'Basketball',
        price: 2800000,
        stock: 5,
        size: '44',
        sku: 'NK-AJ1-RED',
        imageUrl: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=1000',
        createdAt: Date.now()
      },
      {
        name: 'New Balance 574 Grey',
        brand: 'New Balance',
        category: 'Casual',
        price: 1450000,
        stock: 15,
        size: '42',
        sku: 'NB-574-GR',
        imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23a50?auto=format&fit=crop&q=80&w=1000',
        createdAt: Date.now()
      },
      {
        name: 'Chuck Taylor All Star',
        brand: 'Converse',
        category: 'Casual',
        price: 750000,
        stock: 30,
        size: '41',
        sku: 'CV-CT-WH',
        imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1000',
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
