import initSqlJs from 'sql.js';
import { Product, UsageRecord } from '../types/inventory';

let db: any = null;

export const initDB = async () => {
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      safetyPeriod INTEGER NOT NULL,
      activeIngredient TEXT NOT NULL,
      dosagePerHundredLt REAL NOT NULL,
      lastUpdated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      totalWaterAmount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usage_products (
      usage_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      calculated_usage REAL NOT NULL,
      unit TEXT NOT NULL,
      FOREIGN KEY (usage_id) REFERENCES usage_records(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Load data from localStorage if exists
  const savedData = localStorage.getItem('inventoryDB');
  if (savedData) {
    const uint8Array = new Uint8Array(savedData.split(',').map(Number));
    db = new SQL.Database(uint8Array);
  }

  // Save to localStorage before page unload
  window.addEventListener('beforeunload', () => {
    const data = db.export();
    const arr = Array.from(data);
    localStorage.setItem('inventoryDB', arr.toString());
  });
};

export const insertProduct = (product: Product) => {
  const stmt = db.prepare(`
    INSERT INTO products (id, name, category, quantity, unit, safetyPeriod, 
    activeIngredient, dosagePerHundredLt, lastUpdated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    product.id,
    product.name,
    product.category,
    product.quantity,
    product.unit,
    product.safetyPeriod,
    product.activeIngredient,
    product.dosagePerHundredLt,
    product.lastUpdated.toISOString()
  ]);
  stmt.free();
};

export const updateProduct = (product: Product) => {
  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, category = ?, quantity = ?, unit = ?, safetyPeriod = ?,
    activeIngredient = ?, dosagePerHundredLt = ?, lastUpdated = ?
    WHERE id = ?
  `);

  stmt.run([
    product.name,
    product.category,
    product.quantity,
    product.unit,
    product.safetyPeriod,
    product.activeIngredient,
    product.dosagePerHundredLt,
    product.lastUpdated.toISOString(),
    product.id
  ]);
  stmt.free();
};

export const deleteProduct = (id: string) => {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run([id]);
  stmt.free();
};

export const getAllProducts = (): Product[] => {
  const stmt = db.prepare('SELECT * FROM products');
  const products: Product[] = [];
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    products.push({
      ...row,
      lastUpdated: new Date(row.lastUpdated)
    });
  }
  
  stmt.free();
  return products;
};

export const insertUsageRecord = (record: UsageRecord) => {
  db.run('BEGIN TRANSACTION');

  try {
    const recordStmt = db.prepare(`
      INSERT INTO usage_records (id, date, totalWaterAmount)
      VALUES (?, ?, ?)
    `);

    recordStmt.run([
      record.id,
      record.date.toISOString(),
      record.totalWaterAmount
    ]);
    recordStmt.free();

    const productStmt = db.prepare(`
      INSERT INTO usage_products (usage_id, product_id, product_name, calculated_usage, unit)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const product of record.products) {
      productStmt.run([
        record.id,
        product.productId,
        product.productName,
        product.calculatedUsage,
        product.unit
      ]);
    }
    productStmt.free();

    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
};

export const getAllUsageRecords = (): UsageRecord[] => {
  const records: UsageRecord[] = [];
  
  const recordStmt = db.prepare('SELECT * FROM usage_records');
  while (recordStmt.step()) {
    const record = recordStmt.getAsObject();
    
    const productStmt = db.prepare('SELECT * FROM usage_products WHERE usage_id = ?');
    const products = [];
    
    productStmt.bind([record.id]);
    while (productStmt.step()) {
      const product = productStmt.getAsObject();
      products.push({
        productId: product.product_id,
        productName: product.product_name,
        calculatedUsage: product.calculated_usage,
        unit: product.unit
      });
    }
    productStmt.free();

    records.push({
      ...record,
      date: new Date(record.date),
      products
    });
  }
  recordStmt.free();

  return records;
};