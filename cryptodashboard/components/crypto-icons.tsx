// Mapeamento de símbolos para cores temáticas
export const cryptoColors: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  XRP: "#23292F",
  BNB: "#F3BA2F",
  SOL: "#00FFA3",
  DOGE: "#C2A633",
  ADA: "#0033AD",
  TRX: "#EF0027",
  TON: "#0088CC",
  LINK: "#2A5ADA",
}

interface CryptoIconProps {
  symbol: string
  size?: number
}

export function CryptoIcon({ symbol, size = 24 }: CryptoIconProps) {
  const backgroundColor = cryptoColors[symbol] || "#e2e8f0"

  return (
    <div
      className="flex items-center justify-center rounded-full overflow-hidden font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor,
        color: "#FFFFFF",
        fontSize: size * 0.4,
      }}
    >
      {symbol}
    </div>
  )
}

