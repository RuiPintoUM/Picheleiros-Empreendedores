"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { fetchAllCryptoData, getCryptoTableData } from "@/lib/data-service"

// Cores para cada criptomoeda
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

// Componente para exibir o logo da criptomoeda
function CryptoLogo({ symbol }: { symbol: string }) {
  const backgroundColor = cryptoColors[symbol] || "#e2e8f0"

  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-0"
      style={{ backgroundColor }}
    >
      <span className="text-white font-bold text-xs">{symbol}</span>
    </div>
  )
}

export function CryptoTable() {
  const [sortColumn, setSortColumn] = useState("allocation")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [cryptoData, setCryptoData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const allCryptoData = await fetchAllCryptoData()
        const tableData = getCryptoTableData(allCryptoData)
        setCryptoData(tableData)
      } catch (error) {
        console.error("Error loading crypto table data:", error)
        // Fallback to mock data
        setCryptoData([
          {
            id: "btc",
            name: "Bitcoin",
            symbol: "BTC",
            price: 67231.89,
            allocation: 50,
            change24h: 2.3,
            prediction7d: 5.8,
          },
          {
            id: "eth",
            name: "Ethereum",
            symbol: "ETH",
            price: 3543.67,
            allocation: 16,
            change24h: 4.1,
            prediction7d: 12.3,
          },
          // ... other mock data
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedData = [...cryptoData].sort((a, b) => {
    // @ts-ignore - Dynamic property access
    const valueA = a[sortColumn]
    // @ts-ignore - Dynamic property access
    const valueB = b[sortColumn]

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })

  if (loading) {
    return <div className="w-full py-8 text-center">Carregando dados...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Moeda</TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
            Preço
            {sortColumn === "price" &&
              (sortDirection === "asc" ? (
                <ArrowUp className="inline ml-1 h-4 w-4" />
              ) : (
                <ArrowDown className="inline ml-1 h-4 w-4" />
              ))}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("allocation")}>
            Alocação
            {sortColumn === "allocation" &&
              (sortDirection === "asc" ? (
                <ArrowUp className="inline ml-1 h-4 w-4" />
              ) : (
                <ArrowDown className="inline ml-1 h-4 w-4" />
              ))}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("change24h")}>
            24h
            {sortColumn === "change24h" &&
              (sortDirection === "asc" ? (
                <ArrowUp className="inline ml-1 h-4 w-4" />
              ) : (
                <ArrowDown className="inline ml-1 h-4 w-4" />
              ))}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("prediction7d")}>
            Previsão 7d
            {sortColumn === "prediction7d" &&
              (sortDirection === "asc" ? (
                <ArrowUp className="inline ml-1 h-4 w-4" />
              ) : (
                <ArrowDown className="inline ml-1 h-4 w-4" />
              ))}
          </TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((crypto) => (
          <TableRow key={crypto.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <CryptoLogo symbol={crypto.symbol} />
                <div>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-muted-foreground text-sm">{crypto.symbol}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              $
              {typeof crypto.price === "number"
                ? crypto.price.toLocaleString()
                : Number.parseFloat(crypto.price).toLocaleString()}
            </TableCell>
            <TableCell>{crypto.allocation}%</TableCell>
            <TableCell className={crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}>
              {crypto.change24h >= 0 ? "+" : ""}
              {crypto.change24h}%
            </TableCell>
            <TableCell className={crypto.prediction7d >= 0 ? "text-green-500" : "text-red-500"}>
              {crypto.prediction7d >= 0 ? "+" : ""}
              {crypto.prediction7d}%
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                  <DropdownMenuItem>Ajustar alocação</DropdownMenuItem>
                  <DropdownMenuItem>Remover do basket</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

