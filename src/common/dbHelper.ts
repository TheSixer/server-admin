import { getConnection } from "./dbPool"
import log from './logger'
import { queryCallback } from 'mysql'

let pool: any = null;


const createDb = () => {
  getConnection(async (connection: any) => {
    pool = connection;
    // 检查是否存在数据库，如果不存在则创建
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.NODE_ENV === 'development' ? 'blogdb' : 'coinPay'} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    // 切换到新创建的数据库
    await connection?.query(`USE ${process.env.NODE_ENV === 'development' ? 'blogdb' : 'coinPay'}`);

    // 检查是否存在表，如果不存在则创建
    await connection?.query(`
      CREATE TABLE IF NOT EXISTS article (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        introduction VARCHAR(255),
        tags VARCHAR(255),
        type INT,
        images TEXT,
        view_count INT,
        like_count INT,
        comment_count INT,
        create_time BIGINT,
        edit_time BIGINT
      )
    `);
  })
}

createDb();

export const querySql = (sql: string = '') => {
  return (...args: any[]): Promise<any> => new Promise((resolve, reject) => {
    log.info('====== execute sql ======')
    log.info(sql, ...args);
    const callback: queryCallback = (err, result) => {
      if (err) reject(err)
      else resolve(result);
    }
    if (!sql) pool.query(args.shift(), callback);
    else pool.query(sql, ...args, callback);
  });
}

/**
 * sql transaction
 * @param  {Array} list 
 * const rets = await transaction([
 *     ["insert into user_group values (?,?)",[11,11]],
 *     ["insert into user_friend set ? ",{user_id:'12',friend_id:12}],
 *     'select * from user'
 * ]);
 */
export const transaction = (list: any[]): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(list) || !list.length) return reject('it needs a Array with sql')
    pool.getConnection((err: any, connection: any) => {
      if (err) return reject(err);
      connection.beginTransaction((err: any) => {
        if (err) return reject(err);
        log.info('============ begin execute transaction ============')
        const rets: any[] = [];
        return (function dispatch(i) {
          const args = list[i];
          if (!args) {//finally commit
            connection.commit((err: any) => {
              if (err) {
                connection.rollback();
                connection.release();
                return reject(err);
              }
              log.info('============ success executed transaction ============')
              connection.release();
              resolve(rets);
            });
          } else {
            log.info(args);
            // args = typeof args == 'string' ? [args] : args;
            // const sql = args.shift();
            const callback: queryCallback = (error, ret) => {
              if (error) {
                connection.rollback();
                connection.release();
                return reject(error);
              }
              rets.push(ret);
              dispatch(i + 1);
            }
            if (typeof args == 'string') connection.query(args, callback);
            else connection.query(args.shift(), ...args, callback);
          }
        })(0);
      });
    });
  })
}