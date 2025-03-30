"use client"

import { useTheme } from "next-themes"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useEffect, useState } from "react"
import { fetchRealPrediction } from "@/lib/data-service" // ✅ NOVO IMPORT

interface PredictionChartProps {
  timeframe: string
}

export function PredictionChart({ timeframe }: PredictionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // ✅ Usando dados reais da API
        const predictionData = await fetchRealPrediction(7)
        setData(predictionData)
      } catch (error) {
        console.error("Erro ao carregar previsões reais:", error)
        setData(generateFallbackData())
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [timeframe])

  // ✅ Fallback em caso de falha na API
  const generateFallbackData = () => {
    const days = 7
    const data = []
    let baseValue = 4200
    let predictedValue = 4200

    for (let i = 0; i <= days; i++) {
      if (i < days / 2) {
        const randomChange = Math.random() * 100 - 50
        baseValue += randomChange
        data.push({
          name: `Dia ${i}`,
          atual: baseValue.toFixed(2),
          previsto: null,
        })
      } else {
        const randomChange = Math.random() * 150 - 30
        predictedValue += randomChange
        data.push({
          name: `Dia ${i}`,
          atual: i === days / 2 ? baseValue.toFixed(2) : null,
          previsto: predictedValue.toFixed(2),
        })
      }
    }

    return data
  }

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        Carregando dados...
      </div>
    )
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis dataKey="name" stroke={isDark ? "#888" : "#666"} tick={{ fill: isDark ? "#888" : "#666" }} />
          <YAxis
            stroke={isDark ? "#888" : "#666"}
            tick={{ fill: isDark ? "#888" : "#666" }}
            domain={["auto", "auto"]}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#fff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              color: isDark ? "#fff" : "#000",
            }}
            formatter={(value) => [`$${value}`, ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="atual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Valor Atual"
          />
          <Line
            type="monotone"
            dataKey="previsto"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Previsão"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
