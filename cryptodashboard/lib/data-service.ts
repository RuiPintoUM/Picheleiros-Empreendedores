import Papa from "papaparse"
import { fetchBasketPrediction } from "@/lib/data-service"


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
  const symbols = ["BTC", "ETH", "ADA", "BNB", "SOL", "XRP", "DOGE", "LINK", "TRX", "TON"];
  const results = await Promise.all(symbols.map(fetchCryptoFromAPI));

  const data: Record<string, CryptoData[]> = {};
  symbols.forEach((s, i) => {
    data[s] = results[i];
  });

  return data;
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

export function getCryptoTableData(cryptoData: Record<string, CryptoData[]>): any[] {
  const result: any[] = []

  const processCoin = (
    symbol: string,
    name: string,
    allocation: number,
    predictionMultiplier: number
  ) => {
    const data = cryptoData[symbol]
    if (data && data.length > 1) {
      const latest = data[data.length - 1]
      const prev = data[data.length - 2]
      const change = ((latest.Close - prev.Close) / prev.Close) * 100

      result.push({
        id: symbol.toLowerCase(),
        name,
        symbol,
        price: latest.Close,
        allocation,
        change24h: Number(change.toFixed(2)),
        prediction7d: Number((change * predictionMultiplier).toFixed(2)),
      })
    }
  }

  // Processar todas as moedas
  processCoin("BTC", "Bitcoin", 50, 1.5)
  processCoin("ETH", "Ethereum", 16, 1.4)
  processCoin("ADA", "Cardano", 8, 1.1)
  processCoin("BNB", "Binance Coin", 6, 1.2)
  processCoin("SOL", "Solana", 5, 1.3)
  processCoin("XRP", "XRP", 4, 1.0)
  processCoin("DOGE", "Dogecoin", 4, 1.2)
  processCoin("LINK", "Chainlink", 2, 1.4)
  processCoin("TRX", "TRON", 3, 1.1)
  processCoin("TON", "Toncoin", 2, 1.3)

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

// 🔮 Função para buscar previsões reais do modelo Python via API Flask
export async function fetchRealPrediction(days: number = 7): Promise<
  { name: string; atual: number | null; previsto: number | null }[]
> {
  try {
    const res = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ days })
    })

    if (!res.ok) {
      throw new Error("Erro ao procurar previsão real")
    }

    return await res.json()
  } catch (error) {
    console.error("Erro na previsão real:", error)
    return []
  }
}

export async function fetchCryptoFromAPI(symbol: string): Promise<CryptoData[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/crypto/${symbol}`)
    if (!res.ok) throw new Error("Erro ao procurar dados de " + symbol)
    return await res.json()
  } catch (err) {
    console.error("Erro ao procurar", symbol, err)
    return []
  }
}

export async function fetchLatestBasketClose(): Promise<number> {
  try {
    const data = await fetchBasketData()
    if (!data.length) return 0

    const sorted = [...data].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    )

    const last = sorted[sorted.length - 1]
    return Number(last.Close)
  } catch (err) {
    console.error("Erro ao buscar valor total do basket:", err)
    return 0
  }
}

// Função genérica para buscar a previsão real do basket para N dias
export async function fetchBasketPrediction(days: number): Promise<number | null> {
  try {
    const res = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    })

    if (!res.ok) throw new Error("Erro ao buscar previsão real")

    const data = await res.json()

    // Pegamos o último valor previsto no array
    const ultimo = data.findLast((item: any) => item.previsto !== null)
    return ultimo ? ultimo.previsto : null
  } catch (err) {
    console.error("Erro ao buscar previsão do basket:", err)
    return null
  }
}
