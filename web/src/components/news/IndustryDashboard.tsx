import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  DollarSign,
  Car,
  Battery,
  Globe,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MarketMetric {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

interface CompanyPerformance {
  name: string
  symbol: string
  price: string
  change: string
  changePercent: string
  marketCap: string
  trend: 'up' | 'down' | 'stable'
}

const IndustryDashboard: React.FC = () => {
  const marketMetrics: MarketMetric[] = [
    {
      label: 'Global EV Sales',
      value: '10.2M',
      change: '+2.1M',
      changeType: 'positive',
      trend: 'up',
      icon: <Car className="h-5 w-5" />
    },
    {
      label: 'Battery Prices',
      value: '$132/kWh',
      change: '-$8/kWh',
      changeType: 'positive',
      trend: 'down',
      icon: <Battery className="h-5 w-5" />
    },
    {
      label: 'Charging Stations',
      value: '2.8M',
      change: '+180K',
      changeType: 'positive',
      trend: 'up',
      icon: <Globe className="h-5 w-5" />
    },
    {
      label: 'Investment Flow',
      value: '$89B',
      change: '+$12B',
      changeType: 'positive',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />
    }
  ]

  const topPerformers: CompanyPerformance[] = [
    {
      name: 'Tesla',
      symbol: 'TSLA',
      price: '$245.67',
      change: '+$12.34',
      changePercent: '+5.28%',
      marketCap: '$780.2B',
      trend: 'up'
    },
    {
      name: 'BYD',
      symbol: 'BYDDF',
      price: '$28.45',
      change: '+$1.23',
      changePercent: '+4.52%',
      marketCap: '$89.1B',
      trend: 'up'
    },
    {
      name: 'NIO',
      symbol: 'NIO',
      price: '$8.92',
      change: '-$0.45',
      changePercent: '-4.81%',
      marketCap: '$14.7B',
      trend: 'down'
    },
    {
      name: 'Rivian',
      symbol: 'RIVN',
      price: '$18.76',
      change: '+$0.89',
      changePercent: '+4.98%',
      marketCap: '$18.2B',
      trend: 'up'
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
          <p className="text-muted-foreground">Real-time industry metrics and company performance</p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {metric.icon}
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2">
                {metric.label}
              </p>
              
              <div className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                {metric.change} from last quarter
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top EV Company Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Change</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Market Cap</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((company, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-foreground">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.symbol}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">
                      {company.price}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`font-medium ${company.trend === 'up' ? 'text-green-600' : company.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {company.change}
                      </div>
                      <div className="text-sm text-muted-foreground">{company.changePercent}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {company.marketCap}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {getTrendIcon(company.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Positive Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Battery costs continue to decline, improving EV affordability
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Government incentives driving adoption in key markets
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Charging infrastructure expanding rapidly worldwide
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Supply chain disruptions affecting production capacity
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Raw material costs for batteries remain volatile
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Regulatory uncertainty in some emerging markets
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IndustryDashboard
