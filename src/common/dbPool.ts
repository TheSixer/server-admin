/**
 * database connect pool utility
 * 数据库连接池工具类
 */
import mysql, { Pool, PoolConfig } from 'mysql'
import log from './logger'
let pool: Pool = null;

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PWD || 'admin',
  // database: 'autuforum',
  // charset: 'utf8mb4',//utf8mb4才能保存emoji
  // socketPath: '/var/lib/mysql/mysql.sock',
  // multipleStatements: true,// 可同时查询多条语句, 但不能参数化传值
  // connectionLimit: 100
}
/**
 * get the connection of database
 * 获取数据库连接
 */
export const getConnection = (callback: Function) => {
  if (!pool) {
    log.info("creating pool");
    pool = mysql.createPool(dbConfig);
  }
  pool.getConnection((err, connection) => {
    if (err || !connection) {
      log.error(err);
    } else {
      callback(connection);
    }
  });
}

/**
 * get the connection pool of database
 * 获取数据库连接池
 */
export const getPool = () => {
  if (!pool) {
    log.info("creating pool");
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}