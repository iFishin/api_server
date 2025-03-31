/**
 * 生成指定长度的以"1234567890"循环的字符串
 * @param length 要生成的字符串长度
 * @returns 生成的循环字符串
 */
export function generateRepeatedString(length: number): string {
    const baseString = "1234567890";
    if (length <= 0) return "";
    
    // 计算需要完整循环多少次，以及剩余需要多少个字符
    const fullCycles = Math.floor(length / baseString.length);
    const remainder = length % baseString.length;
    
    // 生成完整循环部分
    const fullPart = baseString.repeat(fullCycles);
    
    // 生成剩余部分
    const remainderPart = baseString.slice(0, remainder);
    
    return fullPart + remainderPart;
  }