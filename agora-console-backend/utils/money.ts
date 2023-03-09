
export const formatMoney = (value, currency) => {
  if (!value) value = '0.00';
  if (!currency) currency = '$';
  if (currency === 'USD') currency = '$';
  if (currency === 'CNY') currency = '¥';
  return `${currency} ${Number(value).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;
};
