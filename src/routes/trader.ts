import * as dao from '../dao'
import { Context } from 'koa';
import { Controller, get } from '../decorator/httpMethod'

@Controller('/trader')
export default class Sign {

  @get('/check')
  async tokenIsvalid(ctx: Context) {
    // const query, { start, limit } = ctx.request.query;
    const query = ctx.request.query;
    const token = query.token || null;
    const countSql = `select * from traders where token='${token || ''}'`
    const result = await dao.varifyToken(countSql);

    return ctx.body = {
      code: 0,
      data: result?.[0]?.end_time > new Date().getTime(),
      msg: 'success'
    }
  }
}