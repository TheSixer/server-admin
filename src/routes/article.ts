import * as dao from '../dao'
import { Context } from 'koa';
import { Controller, post, get } from '../decorator/httpMethod'
import { cloneDeep } from 'lodash';
import { Art } from '@/article';
import { objCamelCase } from '../utils';

@Controller('/article')
export default class Sign {

  @post('/new', true)
  async register(ctx: Context) {
    const params = cloneDeep(ctx.request.body);
    params.tags = params.tags;
    params.images = params.images;
    params.create_time = new Date().getTime();
    params.edit_time = params.create_time;
    const insertRet = await dao.newArticle(params);
    if (!insertRet.affectedRows) {
      return ctx.body = {
        code: -1,
        msg: '创建失败！'
      }
    }
    return ctx.body = {
      code: 0,
      msg: '提交成功！'
    }
  }

  @get('/list')
  async getArticleList(ctx: Context) {
    // const query, { start, limit } = ctx.request.query;
    const query = ctx.request.query;
    const kw = query.kw || null;
    const type = query.type || null;
    const tags = query.tags || null;
    const start = (query.start && parseInt(query.start)) || 0;
    const limit = (query.limit && parseInt(query.limit)) || 10;
    let countSql = `select count(*) as count from article`
    let artSql = `select * from article order by create_time desc limit ${start},${limit}`
    if (kw || type || tags) {
      countSql = `select count(*) as count from article where title like ${(kw ? '"%' + kw + '%"' : '%')}${(type ? ' and type =' + type : '')}${(tags ? ' and tags like "%' + tags + '%" ' : '')}`
      artSql = `select * from article where ${(kw ? 'title like "%' + kw + '%" and ' : '')}${(type ? 'type =' + type + ' and ' : '')}${(tags ? 'tags like "%' + tags + '%" ' : '')}order by create_time desc limit ${start},${limit}`
    }
    const result = await dao.getArticleCount(countSql);
    const res = await dao.getArticle(artSql);
    return ctx.body = {
      code: 0,
      data: {
        rows: res.map((item: Art.Article) => objCamelCase(item)),
        total: result[0].count
      },
      msg: 'success'
    }
  }
}