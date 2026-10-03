export const OPERATOR_LOGOS = {
  GP: require('./operators/gp.png'),
  ROBI: require('./operators/robi.png'),
  BL: require('./operators/banglalink.png'),
  AIRTEL: require('./operators/airtel.png'),
  TT: require('./operators/teletalk.png'),
};

export const getOperatorLogo = (operatorKeyOrName) => {
  if (!operatorKeyOrName) return null;
  const key = String(operatorKeyOrName).toUpperCase();
  if (key.includes('GRAMEEN') || key === 'GP') return OPERATOR_LOGOS.GP;
  if (key.includes('ROBI')) return OPERATOR_LOGOS.ROBI;
  if (key.includes('BANGLA') || key === 'BL') return OPERATOR_LOGOS.BL;
  if (key.includes('AIRTEL')) return OPERATOR_LOGOS.AIRTEL;
  if (key.includes('TELE') || key === 'TT') return OPERATOR_LOGOS.TT;
  return null;
};
