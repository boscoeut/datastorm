import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Zap, 
  Globe, 
  Users, 
  BarChart3,
  ArrowRight,
  Play
} from 'lucide-react'

interface IndustryStat {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

const NewsHeroSection: React.FC = () => {
  const industryStats: IndustryStat[] = [
    {
      label: 'Global EV Market',
      value: '$1.2T',
      change: '+23.5%',
      changeType: 'positive',
      icon: <Globe className="h-5 w-5" />
    },
    {
      label: 'EV Adoption Rate',
      value: '14.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: <Users className="h-5 w-5" />
    },
    {
      label: 'Tech Breakthroughs',
      value: '47',
      change: '+12',
      changeType: 'positive',
      icon: <Zap className="h-5 w-5" />
    },
    {
      label: 'Market Growth',
      value: '+18.7%',
      change: '+3.2%',
      changeType: 'positive',
      icon: <TrendingUp className="h-5 w-5" />
    }
  ]

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
    <div className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-indigo-400 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 mr-2" />
              Industry Intelligence Hub
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Electric Vehicle
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Industry News
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stay ahead with real-time insights, market analysis, and breakthrough developments 
              shaping the future of electric mobility
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Watch Market Overview
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold">
                Subscribe to Updates
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Industry Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {stat.label}
                  </p>
                  
                  <div className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                    {stat.change} from last month
                  </div>
                </CardContent>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-12 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
                <span>Market Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-700" />
                <span>Expert Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-1000" />
                <span>Regulatory Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsHeroSection
