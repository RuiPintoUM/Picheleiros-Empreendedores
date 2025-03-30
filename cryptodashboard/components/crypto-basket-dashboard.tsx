"use client"

import { useState, useEffect } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CandlestickChart,
  Clock,
  Coins,
  DollarSign,
  LineChart,
  Moon,
  RefreshCcw,
  Settings,
  Sun,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PredictionChart } from "@/components/prediction-chart"
import { CryptoTable } from "@/components/crypto-table"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import { BasketAllocationChart } from "@/components/basket-allocation-chart"
import { BasketInfoCard } from "@/components/basket-info-card"
import { fetchAllCryptoData, calculateBasketPerformance } from "@/lib/data-service"

// Componente para exibir o logo da criptomoeda
function CryptoLogo({ symbol }: { symbol: string }) {
  const cryptoColors: Record<string, string> = {
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

  const backgroundColor = cryptoColors[symbol] || "#e2e8f0"

  return (
    <div
      className="flex items-center justify-center w-6 h-6 rounded-full overflow-hidden border-0"
      style={{ backgroundColor }}
    >
      <span className="text-white font-bold text-xs">{symbol}</span>
    </div>
  )
}

export function CryptoBasketDashboard() {
  const [timeframe, setTimeframe] = useState("7d")
  const { theme, setTheme } = useTheme()
  const [performance, setPerformance] = useState({
    totalValue: 4231.89,
    change24h: 5.2,
    prediction7d: 8.4,
    bestPerformer: { symbol: "ETH", change: 12.3 },
    worstPerformer: { symbol: "XRP", change: -2.1 },
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const cryptoData = await fetchAllCryptoData()
        const performanceData = calculateBasketPerformance(cryptoData)
        setPerformance(performanceData)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error loading performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const cryptoData = await fetchAllCryptoData()
      const performanceData = calculateBasketPerformance(cryptoData)
      setPerformance(performanceData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">CryptoBasket Predictor</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6 px-4 md:px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Top 10 criptomoedas baseado em market cap (sem stable coins)</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total do Basket</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${performance.totalValue.toLocaleString()}</div>
                <div
                  className={`flex items-center text-sm ${performance.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {performance.change24h >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  <span>
                    {performance.change24h >= 0 ? "+" : ""}
                    {performance.change24h}%
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsão (7 dias)</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(performance.totalValue * (1 + performance.prediction7d / 100)).toLocaleString()}
                </div>
                <div
                  className={`flex items-center text-sm ${performance.prediction7d >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {performance.prediction7d >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  <span>
                    {performance.prediction7d >= 0 ? "+" : ""}
                    {performance.prediction7d}%
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Performer</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CryptoLogo symbol={performance.bestPerformer.symbol} />
                  <div className="text-2xl font-bold">{performance.bestPerformer.symbol}</div>
                </div>
                <div className="flex items-center text-sm text-green-500 mt-1">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  <span>+{performance.bestPerformer.change}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pior Performer</CardTitle>
                <CandlestickChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CryptoLogo symbol={performance.worstPerformer.symbol} />
                  <div className="text-2xl font-bold">{performance.worstPerformer.symbol}</div>
                </div>
                <div className="flex items-center text-sm text-red-500 mt-1">
                  <ArrowDown className="mr-1 h-4 w-4" />
                  <span>{performance.worstPerformer.change}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="allocation" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="allocation">Alocação</TabsTrigger>
              <TabsTrigger value="prediction">Previsão</TabsTrigger>
              <TabsTrigger value="composition">Composição</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="allocation" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Alocação do Basket</CardTitle>
                    <CardDescription>Distribuição percentual das criptomoedas no seu basket</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BasketAllocationChart />
                  </CardContent>
                </Card>
                <BasketInfoCard />
              </div>
            </TabsContent>
            <TabsContent value="prediction" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Previsão de Preço</CardTitle>
                  <CardDescription>
                    Previsão para os próximos{" "}
                    {timeframe === "24h"
                      ? "24 horas"
                      : timeframe === "7d"
                        ? "7 dias"
                        : timeframe === "30d"
                          ? "30 dias"
                          : "90 dias"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PredictionChart timeframe={timeframe} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="composition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Composição do Basket</CardTitle>
                  <CardDescription>Distribuição atual das criptomoedas no seu basket</CardDescription>
                </CardHeader>
                <CardContent>
                  <CryptoTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Performance</CardTitle>
                  <CardDescription>Performance histórica do seu basket de criptomoedas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Dados históricos serão exibidos aqui
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <footer className="border-t bg-background">
          <div className="container flex h-16 items-center px-4 md:px-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mr-4">
              <Clock className="h-4 w-4" />
              <span>
                Última atualização: {Math.round((new Date().getTime() - lastUpdated.getTime()) / 60000)} minutos atrás
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Dados atualizados em: {lastUpdated.toLocaleDateString()}</span>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

