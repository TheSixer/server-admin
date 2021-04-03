import { camelCase } from "lodash"

/**
 * 
 * @param fileName 
 * @returns 
 */
export const getSuffix = (fileName: string) => {
  return fileName.split('.').pop()
}
/**
 * 重命名
 * @param fileName 
 * @returns 
 */
export const rename = (fileName: string) => {
  return Math.random().toString(16).substr(2) + '.' + getSuffix(fileName)
}

export const objCamelCase = (obj: any) => {
  const result = {};
  Object.keys(obj).forEach((key: string) => {
    result[camelCase(key)] = obj[key];
  });
  return result;
}