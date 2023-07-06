export const shortenAddress = (address: `0x${string}` | string) => {
  return address ? address?.slice(0, 6) + '...' + address?.slice(-4) : '_';
};

export const formatNumberWithUnit = (
  amount: number,
  displayDecimals: number = 2
) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return amount >= item.value;
    });

  if (amount > 1000 * (item?.value ?? 1)) {
    let i = 21;
    for (; ; i++) {
      if (amount < Math.pow(10, i + 1)) {
        break;
      }
    }

    return `${(amount / Math.pow(10, i)).toFixed(displayDecimals)}*1e${i}`;
  }

  return (
    (amount / (item?.value ?? 1)).toFixed(displayDecimals).replace(rx, '$1') +
    (item?.symbol ?? '')
  );
};