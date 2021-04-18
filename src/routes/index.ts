import fs from 'fs'
import path from 'path'
import http from 'http'
import { Context } from 'koa';
import { Controller, get, post } from '../decorator/httpMethod';
import { removeTemImage, upload2Qiniu, uploadFile } from '../utils/upload';
import log from '../common/logger'

const folder = path.normalize(__dirname + '/../../uploads/');

@Controller()
export default class Common {

  /**
   * 检查jwt是否有效
   * @param ctx Context
   */
  @get('/check', true)
  async checkJwt(ctx: Context) {
    ctx.body = {
      code: 0,
      msg: '登录有效'
    };
  }

  /**
   * 上传formData
   * @param ctx Context
   * 参数格式{file:File}
   */
  @post('/upload')
  async upload(ctx: Context) {
    const file: any = ctx.request.files.file;
    const dotPos = file.name.indexOf('.');
    const fileName = file.name.substr(0, dotPos) + new Date().getTime() + file.name.substr(dotPos);
    const filePath = folder + fileName;
    const stream = fs.createWriteStream(filePath);//创建可写流
    fs.createReadStream(file.path).pipe(stream);
    //删除file临时文件
    fs.unlink(file.path, err => {
      if (err) log.error(err)
    });
    ctx.body = {
      code: 0,
      data: filePath,
      msg: 'success'
    };
  }

  /**
   * 上传formData
   * @param ctx Context
   * 参数格式{file:File}
   */
  @post('/upload/qiniu', true)
  async uploadToQiniu(ctx: Context) {
    const file: any = ctx.request.files.file;
    const serverPath = path.join(__dirname, '../../uploads/')
    try {
      // 获取上传图片
      const result: any = await uploadFile(file);
      // 上传到七牛
      const imgPath = path.join(serverPath, result.imgPath);
      const qiniu: any = await upload2Qiniu(imgPath, result.imgKey);
      // 上存到七牛以后 删除本来的缓存图片
      removeTemImage(imgPath);
      ctx.body = {
        code: 0,
        data: qiniu.origin + qiniu.key,
        msg: 'success'
      };
    } catch (error) {
      ctx.body = {
        code: -1,
        msg: error
      };
    }
  }

  /**
   * @param  {[type]}   ctx  [description]
   * 上传base64
   * 参数格式 {name:string;data:string}
   */
  async uploadBase64(ctx: Context) {
    const form = ctx.request.body;
    const { dir, name, ext } = path.parse(form.name);
    const fileName = dir + '/' + name + new Date().getTime() + ext;
    const filePath = folder + fileName;
    const base64Data = form.data.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, dataBuffer);
    ctx.body = {
      code: 0,
      data: filePath,
      msg: 'success'
    };
  }


  /**
   * 批量下载网络文件到本地文件夹
   */
  async downLoad(ctx: Context) {
    const form = ctx.request.body;
    const that = this
    for (const { k, v } of form) {
      that.downLoadRemote(k, v);
    }
    ctx.body = await {
      status: 0,
      msg: 'download success!'
    };
  }

  //下载网络文件到本地
  private downLoadRemote(fileName: string, src: string) {
    let imgData = "";
    const ext = path.extname(src);
    const dir = path.normalize(__dirname + '/../..');

    http.get(src, (res) => {
      res.setEncoding("binary"); //一定要设置response的编码为binary否则下载下来的文件打不开
      res.on("data", (chunk) => {
        imgData += chunk;
      });

      res.on("end", () => {
        //必须使用绝对路径
        fs.writeFile(dir + "/public/download/" + fileName + ext, imgData, "binary", (err) => {
          console.log("%s download %s", fileName, err ? "fail" : "success");
        });
      });
    });
  }


  // /**
  //  * download apply excel
  //  * @param  {[type]}   ctx  [description]
  //  */
  // @get('/download')
  // async downloadFile(ctx: Context) {
  //   const { ids } = ctx.request.query;
  //   let list: any[];
  //   if (!ids) {
  //     list = await dao.getApply()
  //   } else {
  //     list = await dao.sql(`select * from apply where id in (${ids})`);
  //   }
  //   const data = [['机构', '用户名称', '联系方式', '合作区域', '合作形式', '提交时间']];
  //   list.forEach(l => {
  //     data.push([l.organ, l.name, l.contact, l.area, l.options.replace(/\s/g, '/'), new Date(l.create_date * 1000)])
  //   });
  //   const options = { '!cols': [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 10 }] };
  //   const buffer = xlsx.build([{ name: "合作列表", data }], options);
  //   ctx.attachment('申请合作列表.xlsx');
  //   ctx.body = buffer;
  // }
}
