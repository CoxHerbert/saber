// utils/calculate.js
import BigNumber from 'bignumber.js';
// import ElementPlus from 'element-plus';
import { ElMessage } from 'element-plus';

/**
 * 解析尺寸字符串（毫米）
 * @param {string} shape 形状（board/stick/tube/squareTube/cornerIron）
 * @param {string} size  尺寸字符串（如"1000*500*10"）
 * @returns {BigNumber[]} 转换为米的参数数组
 */
export function parseSize(shape, size) {
  if (!size) return [];
  const parts = size.split('*').map(p => {
    return new BigNumber(p.trim()); // 默认不转换毫米到米
  });
  switch (shape) {
    case 'DC_RAW_MATERIAL_TYPE_B':
      return parts.slice(0, 3); // 板：长*宽*厚
    case 'DC_RAW_MATERIAL_TYPE_length':
      return parts.slice(0, 2); // 棒：直径*长度
    case 'DC_RAW_MATERIAL_TYPE_YG':
      return parts.slice(0, 3); // 管：外径*壁厚*长度
    case 'DC_RAW_MATERIAL_TYPE_FT':
      return parts.slice(0, 4); // 方管：边长1*边长2*壁厚*长度
    case 'DC_RAW_MATERIAL_TYPE_JT':
      return parts.slice(0, 4); // 角铁：边长1*边长2*壁厚*长度
    default:
      return [];
  }
}

/**
 * 计算体积（立方米）
 * @param {string} shape 形状
 * @param {string} size  尺寸字符串
 * @returns {BigNumber} 体积（m³）
 */
export function calculateWeight(shape, size, density) {
  // 解析尺寸参数
  const params = parseSize(shape, size);
  if (params.length === 0) return new BigNumber(0);

  // 验证密度有效性
  const densityBN = new BigNumber(density || 0);
  if (densityBN.isLessThanOrEqualTo(0)) return new BigNumber(0);

  const π = new BigNumber(Math.PI);
  let volumeCubicMillimeter; // 体积（立方毫米）

  // 计算体积（立方毫米）
  switch (shape) {
    // 板：体积 = 长×宽×厚
    case 'DC_RAW_MATERIAL_TYPE_B': {
      const [A, B, C] = params;
      volumeCubicMillimeter = A.multipliedBy(B).multipliedBy(C);
      break;
    }
    // 棒：体积 = π×(直径/2)²×长度
    case 'DC_RAW_MATERIAL_TYPE_length': {
      const [d, L] = params;
      console.log(d, L);

      volumeCubicMillimeter = π.multipliedBy(d.dividedBy(2).pow(2)).multipliedBy(L);

      break;
    }

    // 管：体积 = π×[(外径/2)² - (内径/2)²]×长度
    case 'DC_RAW_MATERIAL_TYPE_YG': {
      const [D, T, L] = params;
      // 验证参数有效性，确保外径大于两倍壁厚
      if (D.isLessThanOrEqualTo(T.multipliedBy(2))) {
        return ElMessage.error('外径必须大于壁厚');
      }
      const innerD = D.minus(T.multipliedBy(2));
      const outerArea = π.multipliedBy(D.dividedBy(2).pow(2));
      const innerArea = π.multipliedBy(innerD.dividedBy(2).pow(2));
      volumeCubicMillimeter = outerArea.minus(innerArea).multipliedBy(L);
      break;
    }
    // 方管：体积 = 2×壁厚×(边长1+边长2)×长度
    case 'DC_RAW_MATERIAL_TYPE_FT': {
      const [a, b, T, L] = params;
      volumeCubicMillimeter = new BigNumber(2)
        .multipliedBy(T)
        .multipliedBy(a.plus(b))
        .multipliedBy(L);
      break;
    }
    // 角铁：体积 = 壁厚×(边长1+边长2)×长度
    case 'DC_RAW_MATERIAL_TYPE_JT': {
      const [a, b, T, L] = params;
      volumeCubicMillimeter = T.multipliedBy(a.plus(b)).multipliedBy(L);
      break;
    }
    default:
      return new BigNumber(0);
  }

  // 单位转换：立方毫米 -> 立方米（1立方米 = 1e9 立方毫米）
  const volumeCubicMeter = volumeCubicMillimeter.dividedBy(new BigNumber(1e6));

  // 重量 = 体积（立方米） × 密度（kg/m³）
  const weight = volumeCubicMeter.multipliedBy(densityBN).toNumber();

  return { volume: volumeCubicMeter.toNumber(), weight };
}

/**
 * 计算表面积（平方米，按需扩展）
 * @param {string} shape 形状
 * @param {string} size  尺寸字符串
 * @returns {BigNumber} 表面积（m²）
 */
export function calculateArea(shape, size) {
  // 解析尺寸参数
  const params = parseSize(shape, size);
  if (params.length === 0) return new BigNumber(0);

  const π = new BigNumber(Math.PI);
  let areaSquareMillimeter; // 面积（平方毫米）

  // 计算表面积（平方毫米）
  switch (shape) {
    // 板：表面积 = 2×(长×宽 + 长×厚 + 宽×厚)
    case 'DC_RAW_MATERIAL_TYPE_B': {
      const [A, B, C] = params;
      const face1 = A.multipliedBy(B); // 长宽面
      const face2 = A.multipliedBy(C); // 长厚面
      const face3 = B.multipliedBy(C); // 宽厚面
      areaSquareMillimeter = face1.plus(face2).plus(face3).multipliedBy(2);
      break;
    }
    // 棒：表面积 = 2×π×(直径/2)² + π×直径×长度（上下底面积+侧面积）
    case 'DC_RAW_MATERIAL_TYPE_length': {
      const [d, L] = params;
      const radius = d.dividedBy(2);
      const circleArea = π.multipliedBy(radius.pow(2)); // 单个底面积
      const sideArea = π.multipliedBy(d).multipliedBy(L); // 侧面积
      areaSquareMillimeter = circleArea.multipliedBy(2).plus(sideArea);
      break;
    }
    // 管：表面积 = π×外径×长度（侧面积，忽略两端开口）
    case 'DC_RAW_MATERIAL_TYPE_YG': {
      const [D, T, L] = params;
      areaSquareMillimeter = π.multipliedBy(D).multipliedBy(L);
      break;
    }
    // 方管：表面积 = 2×(边长1 + 边长2)×长度（侧面积）
    case 'DC_RAW_MATERIAL_TYPE_FT': {
      const [a, b, T, L] = params;
      areaSquareMillimeter = new BigNumber(2).multipliedBy(a.plus(b)).multipliedBy(L);
      break;
    }
    // 角铁：表面积 = 2×(边长1 + 边长2)×长度（侧面积）
    case 'DC_RAW_MATERIAL_TYPE_JT': {
      const [a, b, T, L] = params;
      areaSquareMillimeter = new BigNumber(2).multipliedBy(a.plus(b)).multipliedBy(L);
      break;
    }
    default:
      return new BigNumber(0);
  }

  // 单位转换：平方毫米 -> 平方厘米（1平方米 = 1e4 平方厘米）
  return areaSquareMillimeter.dividedBy(new BigNumber(100)).toNumber();
}

/**
 * 计算单个工艺的费用
 * @param {object} process    工艺对象（含pricingMethod、workHours、unitPrice等）
 * @param {BigNumber} volume  体积（m³）
 * @param {BigNumber} area    表面积（m²）
 * @param {BigNumber} weight  重量（kg）
 * @param {number} qtyValue        下单数量
 * @returns {BigNumber} 工艺费用（元）
 */
export function calculateProcessCost(process, areaValue, weightValue, qtyValue, workHours) {
  const { value, price } = process;
  qtyValue = new BigNumber(qtyValue || 1);
  areaValue = new BigNumber(areaValue || 0);
  weightValue = new BigNumber(weightValue || 0);
  // 将 workHours 转换为 BigNumber 类型，若为 undefined 则默认值为 0
  workHours = new BigNumber(workHours || 0);
  // 假设 workHours 原本为分钟，转换为小时
  workHours = workHours.dividedBy(60);

  switch (value) {
    case 'DC_TECHNOLOGY_PRICING_METHOD_J':
      return new BigNumber(price || 0);
    case 'DC_TECHNOLOGY_PRICING_METHOD_ZL':
      return weightValue.multipliedBy(new BigNumber(price || 0));
    case 'DC_TECHNOLOGY_PRICING_METHOD_MJ':
      return areaValue.multipliedBy(new BigNumber(price || 0));
    case 'DC_TECHNOLOGY_PRICING_METHOD_GS':
      return workHours.multipliedBy(new BigNumber(price || 0));
    default:
      return new BigNumber(0);
  }
}
// DC_TECHNOLOGY_PRICING_METHOD_GS        工时
// DC_TECHNOLOGY_PRICING_METHOD_ZL        重量
// DC_TECHNOLOGY_PRICING_METHOD_J        件
// DC_TECHNOLOGY_PRICING_METHOD_MJ        面积
export function formatBigNumber(num) {
  if (!num) return '0';

  // 转换为 BigNumber 并四舍五入保留4位小数
  const bn = new BigNumber(num);
  const fixed4 = bn.toFixed(2); // 先保留2位小数（会补零）

  // 移除末尾的零和可能的小数点
  return fixed4.replace(/\.?0+$/, '');
}
