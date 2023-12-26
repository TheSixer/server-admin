import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import jwt from './middleware/jwt'
import { ROUTES_METADATA, ROUTER_MAP } from './constant'
import { RouteMeta } from './type'
import Router from 'koa-router'

const addRouter = (router: Router) => {
  const ctrPath = path.join(__dirname, 'routes');
  const modules: ObjectConstructor[] = [];
  // 扫描routes文件夹，收集所有routes
  fs.readdirSync(ctrPath).forEach(name => {
    if (/^[^.]+\.(t|j)s$/.test(name)) {
      modules.push(require(path.join(ctrPath, name)).default)
    }
  });
  // 结合meta数据添加路由 和 验证
  modules.forEach(m => {
    const routesMetadata: string = Reflect.getMetadata(
      ROUTES_METADATA,
      m,
    );
    const routerMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, m, 'method') || [];
    if (routerMap.length) {
      const ctr: any = new m();
      routerMap.forEach(route => {
        const { name, method, path, isVerify } = route;
        router[method](routesMetadata + path, jwt(path, isVerify), ctr[name]);
      })
    }
  })
}

export default addRouter