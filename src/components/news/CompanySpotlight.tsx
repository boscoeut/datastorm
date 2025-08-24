import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Building2,
  Car,
  Battery,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react'

interface CompanyData {
  name: string
  symbol: string
  logo: string
  industry: string
  headquarters: string
  founded: string
  ceo: string
  marketCap: string
  stockPrice: string
  priceChange: string
  priceChangePercent: string
  trend: 'up' | 'down' | 'stable'
  keyMetrics: {
    label: string
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
  }[]
  recentNews: string[]
  description: string
}

const CompanySpotlight: React.FC = () => {
  const companies: CompanyData[] = [
    {
      name: 'Tesla',
      symbol: 'TSLA',
      logo: '🚗',
      industry: 'Electric Vehicles',
      headquarters: 'Austin, Texas',
      founded: '2003',
      ceo: 'Elon Musk',
      marketCap: '$780.2B',
      stockPrice: '$245.67',
      priceChange: '+$12.34',
      priceChangePercent: '+5.28%',
      trend: 'up',
      keyMetrics: [
        {
          label: 'Vehicle Deliveries',
          value: '1.8M',
          change: '+0.2M',
          changeType: 'positive'
        },
        {
          label: 'Revenue',
          value: '$96.8B',
          change: '+$12.3B',
          changeType: 'positive'
        },
        {
          label: 'Supercharger Stations',
          value: '5,500+',
          change: '+200',
          changeType: 'positive'
        }
      ],
      recentNews: [
        'New Gigafactory announced in Mexico',
        'Cybertruck production ramping up',
        'FSD Beta v12 released to select users'
      ],
      description: 'Leading electric vehicle manufacturer and clean energy company, pioneering sustainable transportation solutions.'
    },
    {
      name: 'BYD',
      symbol: 'BYDDF',
      logo: '🔋',
      industry: 'Electric Vehicles & Batteries',
      headquarters: 'Shenzhen, China',
      founded: '1995',
      ceo: 'Wang Chuanfu',
      marketCap: '$89.1B',
      stockPrice: '$28.45',
      priceChange: '+$1.23',
      priceChangePercent: '+4.52%',
      trend: 'up',
      keyMetrics: [
        {
          label: 'Vehicle Sales',
          value: '3.0M',
          change: '+0.8M',
          changeType: 'positive'
        },
        {
          label: 'Battery Production',
          value: '150 GWh',
          change: '+25 GWh',
          changeType: 'positive'
        },
        {
          label: 'Global Markets',
          value: '70+',
          change: '+5',
          changeType: 'positive'
        }
      ],
      recentNews: [
        'Expanding European market presence',
        'New Blade Battery technology unveiled',
        'Partnership with major automakers announced'
      ],
      description: 'World\'s largest electric vehicle manufacturer, specializing in batteries, electric vehicles, and renewable energy.'
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Company Spotlight</h2>
          <p className="text-muted-foreground">Key players shaping the electric vehicle industry</p>
        </div>
        <Button variant="outline" size="sm">
          <Building2 className="h-4 w-4 mr-2" />
          View All Companies
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((company, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{company.logo}</div>
                  <div>
                    <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {company.symbol}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {company.industry}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {company.stockPrice}
                  </div>
                  <div className={`text-sm font-medium ${company.trend === 'up' ? 'text-green-600' : company.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {company.priceChange} ({company.priceChangePercent})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Market Cap: {company.marketCap}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Company Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.description}
              </p>

              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Headquarters:</span>
                  <div className="font-medium">{company.headquarters}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Founded:</span>
                  <div className="font-medium">{company.founded}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">CEO:</span>
                  <div className="font-medium">{company.ceo}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trend:</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(company.trend)}
                    <span className="capitalize">{company.trend}</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Key Metrics</h4>
                <div className="grid grid-cols-1 gap-3">
                  {company.keyMetrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                        <div className="font-medium text-foreground">{metric.value}</div>
                      </div>
                      <div className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent News */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Recent News</h4>
                <ul className="space-y-2">
                  {company.recentNews.map((news, newsIndex) => (
                    <li key={newsIndex} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{news}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button variant="outline" size="sm" className="flex-1">
                  <Building2 className="h-4 w-4 mr-2" />
                  Company Profile
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Industry Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industry Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Major EV Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$2.5T+</div>
              <div className="text-sm text-muted-foreground">Combined Market Cap</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Countries with EV Incentives</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanySpotlight
