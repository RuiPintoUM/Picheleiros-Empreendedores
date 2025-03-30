import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function BasketInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Basket</CardTitle>
        <CardDescription>Detalhes sobre a estratégia e composição</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <div className="font-medium">Estratégia:</div>
          <div>Top 10 criptomoedas por market cap</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <div className="font-medium">Exclusões:</div>
          <div>Stablecoins</div>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <div className="font-medium">Categorias:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Layer 1</Badge>
            <Badge variant="outline">Smart Contracts</Badge>
            <Badge variant="outline">DeFi</Badge>
            <Badge variant="outline">Meme</Badge>
            <Badge variant="outline">Oracles</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

