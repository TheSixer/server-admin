import fs from 'fs'
import path from 'path'
import qiniu from 'qiniu';
import { qiniuKey } from '../config';
import { rename } from '.';

const folder = path.normalize(__dirname + '/../../uploads/');

// 写入目次
const mkdirsSync = (dirname: string) => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  return false
}

// 删除文件
export const removeTemImage = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
  })
}

export const uploadFile = (file: any) => {
  const fileName = rename(file.name);
  const filePath = folder + fileName;
  return new Promise((resolve, reject) => {
    const render = fs.createReadStream(file.path);
    // 创建写入流
    const upStream = fs.createWriteStream(filePath);
    render.pipe(upStream);
    upStream.on('finish', () => {
      console.log('finished...')
      resolve({
        imgPath: fileName,
        imgKey: fileName
      })
    });
    upStream.on('error', (err) => {
      console.log('error...')
      reject(err)
    });
  });
};

export const upload2Qiniu = (filePath: string, key: string) => {
  const { accessKey, secretKey, bucket, origin } = qiniuKey;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  const options = {
    scope: bucket // 你的七牛存储对象
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)

  const config: any = new qiniu.conf.Config()
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z2
  const localFile = filePath
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved({...respBody, origin})
      } else {
        resolved(respBody)
      }
    })
  })
}