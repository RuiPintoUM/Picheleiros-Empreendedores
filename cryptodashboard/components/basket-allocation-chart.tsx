"use client"

import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts"
import { useState, useEffect } from "react"
import { getCryptoAllocation, fetchAllCryptoData } from "@/lib/data-service"

// Componente para renderizar o setor ativo (quando o usuário passa o mouse)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        strokeWidth={0}
      />
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#FFFFFF" className="text-base font-bold">
        {`${payload.name}: ${value}%`}
      </text>
    </g>
  )
}

export function BasketAllocationChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [basketData, setBasketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const cryptoData = await fetchAllCryptoData()
        const allocationData = getCryptoAllocation(cryptoData)
        setBasketData(allocationData)
      } catch (error) {
        console.error("Error loading allocation data:", error)
        // Fallback data
        setBasketData([
          { name: "BTC", value: 50, color: "#F7931A" },
          { name: "ETH", value: 16, color: "#627EEA" },
          { name: "XRP", value: 8, color: "#23292F" },
          { name: "BNB", value: 6, color: "#F3BA2F" },
          { name: "SOL", value: 5, color: "#00FFA3" },
          { name: "DOGE", value: 4, color: "#C2A633" },
          { name: "ADA", value: 4, color: "#0033AD" },
          { name: "TRX", value: 3, color: "#EF0027" },
          { name: "TON", value: 2, color: "#0088CC" },
          { name: "LINK", value: 2, color: "#2A5ADA" },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  if (loading) {
    return <div className="w-full h-[250px] flex items-center justify-center">Carregando dados...</div>
  }

  return (
    <div className="w-full">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={basketData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              paddingAngle={1}
              strokeWidth={0} // Sem bordas
            >
              {basketData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda simplificada */}
      <div className="grid grid-cols-5 gap-x-2 gap-y-1 mt-4">
        {basketData.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className={`text-xs truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {entry.name} {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

