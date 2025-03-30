import Papa from "papaparse"

// URLs for the CSV files
const DATA_URLS = {
  basket:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/basket_with_rsi_and_ma14-4I7GKhaI1ZKvk0KWged8988il0t7VU.csv",
  ada: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ADA_USD_2020_2025_Daily-mSX8v5xejZAAPY93myTeKigIaE5lx1.csv",
  bnb: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BNB_USD_2020_2025_Daily-MALyYDo5hVikNfvE1LSEofMM6PYXlX.csv",
  btc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BTC_USD_2020_2025_Daily-qu93LaxMK43axL8Zh9JdiKbUBHFq8t.csv",
}

// Types for the CSV data
export interface BasketData {
  Date: string
  Close: number
  Open: number
  Price_diff: number
  fng_value: string
  RSI: string
  MA_14: string
}

export interface CryptoData {
  Date: string
  Close: number
  High: number
  Low: number
  Open: number
  Volume: number
}

// Function to fetch and parse CSV data
export async function fetchCSV<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url)
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as T[])
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return []
  }
}

// Function to fetch basket data
export async function fetchBasketData(): Promise<BasketData[]> {
  return fetchCSV<BasketData>(DATA_URLS.basket)
}

// Function to fetch crypto price data
export async function fetchCryptoData(symbol: string): Promise<CryptoData[]> {
  const url = DATA_URLS[symbol.toLowerCase() as keyof typeof DATA_URLS]
  if (!url) {
    console.error(`No data URL found for symbol: ${symbol}`)
    return []
  }
  return fetchCSV<CryptoData>(url)
}

// Function to fetch all crypto data
export async function fetchAllCryptoData(): Promise<Record<string, CryptoData[]>> {
  const [ada, bnb, btc] = await Promise.all([fetchCryptoData("ada"), fetchCryptoData("bnb"), fetchCryptoData("btc")])

  return {
    ADA: ada,
    BNB: bnb,
    BTC: btc,
  }
}

// Function to process data for prediction chart
export function processPredictionData(data: BasketData[], timeframe: string): any[] {
  // Filter data based on timeframe
  const days = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90

  // Sort data by date (ascending)
  const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

  // Get the last 'days' entries
  const recentData = sortedData.slice(-days)

  // Format data for the chart
  return recentData.map((item) => ({
    name: timeframe === "24h" ? new Date(item.Date).getHours() + "h" : new Date(item.Date).toLocaleDateString(),
    atual: Number.parseFloat(item.Close.toString()),
    previsto: null,
  }))
}

// Function to get crypto allocation data
export function getCryptoAllocation(cryptoData: Record<string, CryptoData[]>): any[] {
  // This is a simplified example - in a real app, you'd calculate this from portfolio data
  return [
    { name: "BTC", value: 50, color: "#F7931A" },
    { name: "ETH", value: 16, color: "#627EEA" },
    { name: "ADA", value: 8, color: "#0033AD" },
    { name: "BNB", value: 6, color: "#F3BA2F" },
    { name: "SOL", value: 5, color: "#00FFA3" },
    { name: "DOGE", value: 4, color: "#C2A633" },
    { name: "XRP", value: 4, color: "#23292F" },
    { name: "TRX", value: 3, color: "#EF0027" },
    { name: "TON", value: 2, color: "#0088CC" },
    { name: "LINK", value: 2, color: "#2A5ADA" },
  ]
}

// Function to get crypto table data
export function getCryptoTableData(cryptoData: Record<string, CryptoData[]>): any[] {
  const result = []

  // Process BTC data
  if (cryptoData.BTC && cryptoData.BTC.length > 0) {
    const btcData = cryptoData.BTC
    const latestBtc = btcData[btcData.length - 1]
    const prevBtc = btcData[btcData.length - 2]
    const change24h = ((latestBtc.Close - prevBtc.Close) / prevBtc.Close) * 100

    result.push({
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      price: Number.parseFloat(latestBtc.Close.toString()),
      allocation: 50,
      change24h: Number.parseFloat(change24h.toFixed(2)),
      prediction7d: Number.parseFloat((change24h * 1.5).toFixed(2)), // Simple prediction
    })
  }

  // Process BNB data
  if (cryptoData.BNB && cryptoData.BNB.length > 0) {
    const bnbData = cryptoData.BNB
    const latestBnb = bnbData[bnbData.length - 1]
    const prevBnb = bnbData[bnbData.length - 2]
    const change24h = ((latestBnb.Close - prevBnb.Close) / prevBnb.Close) * 100

    result.push({
      id: "bnb",
      name: "Binance Coin",
      symbol: "BNB",
      price: latestBnb.Close,
      allocation: 6,
      change24h: Number.parseFloat(change24h.toFixed(2)),
      prediction7d: Number.parseFloat((change24h * 1.2).toFixed(2)), // Simple prediction
    })
  }

  // Process ADA data
  if (cryptoData.ADA && cryptoData.ADA.length > 0) {
    const adaData = cryptoData.ADA
    const latestAda = adaData[adaData.length - 1]
    const prevAda = adaData[adaData.length - 2]
    const change24h = ((latestAda.Close - prevAda.Close) / prevAda.Close) * 100

    result.push({
      id: "ada",
      name: "Cardano",
      symbol: "ADA",
      price: latestAda.Close,
      allocation: 8,
      change24h: Number.parseFloat(change24h.toFixed(2)),
      prediction7d: Number.parseFloat((change24h * 1.1).toFixed(2)), // Simple prediction
    })
  }

  // Add other cryptocurrencies with mock data to complete the table
  const mockData = [
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      price: 3543.67,
      allocation: 16,
      change24h: 4.1,
      prediction7d: 12.3,
    },
    {
      id: "xrp",
      name: "XRP",
      symbol: "XRP",
      price: 0.54,
      allocation: 4,
      change24h: -2.1,
      prediction7d: -1.3,
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      price: 148.76,
      allocation: 5,
      change24h: 6.7,
      prediction7d: 9.2,
    },
    {
      id: "doge",
      name: "Dogecoin",
      symbol: "DOGE",
      price: 0.15,
      allocation: 4,
      change24h: 3.2,
      prediction7d: 7.5,
    },
    {
      id: "trx",
      name: "TRON",
      symbol: "TRX",
      price: 0.12,
      allocation: 3,
      change24h: 0.9,
      prediction7d: 2.1,
    },
    {
      id: "ton",
      name: "Toncoin",
      symbol: "TON",
      price: 5.67,
      allocation: 2,
      change24h: 5.3,
      prediction7d: 8.7,
    },
    {
      id: "link",
      name: "Chainlink",
      symbol: "LINK",
      price: 14.32,
      allocation: 2,
      change24h: 4.5,
      prediction7d: 10.2,
    },
  ]

  // Add mock data for cryptocurrencies not in our dataset
  mockData.forEach((mock) => {
    if (!result.find((item) => item.id === mock.id)) {
      result.push(mock)
    }
  })

  return result
}

// Function to calculate basket performance
export function calculateBasketPerformance(cryptoData: Record<string, CryptoData[]>): {
  totalValue: number
  change24h: number
  prediction7d: number
  bestPerformer: { symbol: string; change: number }
  worstPerformer: { symbol: string; change: number }
} {
  let totalValue = 0
  let weightedChange = 0
  let weightedPrediction = 0

  const performers: Array<{ symbol: string; change: number }> = []

  // Process available crypto data
  Object.entries(cryptoData).forEach(([symbol, data]) => {
    if (data.length >= 2) {
      const latest = data[data.length - 1]
      const prev = data[data.length - 2]
      const change = ((latest.Close - prev.Close) / prev.Close) * 100

      performers.push({ symbol, change })

      // Calculate weighted values based on allocation
      const allocation = symbol === "BTC" ? 0.5 : symbol === "BNB" ? 0.06 : symbol === "ADA" ? 0.08 : 0
      totalValue += latest.Close * allocation * 100 // Simplified calculation
      weightedChange += change * allocation
      weightedPrediction += change * 1.3 * allocation // Simple prediction
    }
  })

  // Sort performers to find best and worst
  performers.sort((a, b) => b.change - a.change)

  return {
    totalValue: Number.parseFloat(totalValue.toFixed(2)),
    change24h: Number.parseFloat(weightedChange.toFixed(2)),
    prediction7d: Number.parseFloat(weightedPrediction.toFixed(2)),
    bestPerformer: performers[0] || { symbol: "ETH", change: 4.1 },
    worstPerformer: performers[performers.length - 1] || { symbol: "XRP", change: -2.1 },
  }
}

