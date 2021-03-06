import { querySql } from '../common/dbHelper'
import { PlainObject, MysqlResult } from '@/type'
import { Art } from '@/article';

// const userDao = querySql({
// 	sql: null,
// 	count: 'select count(*) as count from user where ?',
// 	getUser: 'select * from user where ?',
// 	insert: 'insert into user set ?',
// 	update: 'update user set ? where id = ?',
// 	delete: 'delete from user where ?'
// });


export const sql = querySql('');
export const count: (arg: PlainObject) => Promise<PlainObject[]> = querySql('select count(*) as count from user where ?')
export const getUser: (arg: PlainObject) => Promise<PlainObject[]> = querySql('select * from user where ?')
export const insert: (arg: PlainObject) => Promise<MysqlResult> = querySql('insert into user set ?')
export const update: (arg: any[]) => Promise<MysqlResult> = querySql('update user set ? where id = ?')
export const del: (arg: PlainObject) => Promise<MysqlResult> = querySql('delete from user where ?')

export const newArticle: (arg: PlainObject) => Promise<MysqlResult> = querySql('insert into article set ?')
export const getArticleCount: (arg: string) => Promise<MysqlResult> = querySql()
export const getArticle: (arg: string) => Promise<Art.Article[]> = querySql()