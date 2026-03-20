import mysql from 'mysql2';

// 1. สร้าง Connection Pool เชื่อมต่อไปยัง MySQL ใน Docker
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'easyrice_password', 
  database: 'easyrice_db',       
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2. สร้างตารางแบบ MySQL ถ้ายังไม่มี
const initDB = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS history (
      id VARCHAR(50) PRIMARY KEY,
      create_date TEXT,
      update_date TEXT,
      name TEXT,
      standard_id TEXT,
      standard_name TEXT,
      note TEXT,
      price DECIMAL(10,2),
      sampling_point TEXT,
      date_time_sampling TEXT,
      total_sample INT,
      composition_data TEXT,
      defect_data TEXT,
      standard_data TEXT
    )
  `;
  pool.query(createTableQuery, (err: any) => {
    if (err) {
      console.error("❌ MySQL Init Error:", err);
    } else {
      console.log('✅ เตรียมตาราง History ใน MySQL (Docker) เรียบร้อยพร้อมใช้งาน');
    }
  });
};

initDB();

// 3. Adapter Pattern แบบระบุ Type ชัดเจน (แก้ Error TS2306)
const db = {
  run: (sql: string, params: any[], callback?: (err: any) => void) => {
    pool.query(sql, params, function (err: any, results: any) {
      if (callback) {
        const context = { changes: results ? results.affectedRows : 0 };
        callback.call(context, err);
      }
    });
  },
  all: (sql: string, params: any[], callback: (err: any, rows: any[]) => void) => {
    pool.query(sql, params, (err: any, results: any) => {
      callback(err, results);
    });
  },
  get: (sql: string, params: any[], callback: (err: any, row: any) => void) => {
    pool.query(sql, params, (err: any, results: any) => {
      callback(err, results && results.length > 0 ? results[0] : null);
    });
  }
};

export default db;