import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NewsFeed from '@/components/news/NewsFeed'
import NewsHeroSection from '@/components/news/NewsHeroSection'
import IndustryDashboard from '@/components/news/IndustryDashboard'
import FeaturedArticles from '@/components/news/FeaturedArticles'
import CompanySpotlight from '@/components/news/CompanySpotlight'
import { 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Building2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Globe,
  Zap
} from 'lucide-react'

const NewsPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <NewsHeroSection />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Quick Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Button
            onClick={() => navigate('/vehicles')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Browse Vehicles
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            News Archive
          </Button>

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Industry Reports
          </Button>
        </div>

        {/* Industry Dashboard */}
        <section>
          <IndustryDashboard />
        </section>

        {/* Featured Articles */}
        <section>
          <FeaturedArticles articles={[]} />
        </section>

        {/* Company Spotlight */}
        <section>
          <CompanySpotlight />
        </section>

        {/* News Categories Overview */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                News Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Industry News',
                    description: 'Latest developments and market updates',
                    icon: <Newspaper className="h-6 w-6" />,
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    count: '45 articles'
                  },
                  {
                    title: 'Technology',
                    description: 'Breakthroughs and innovations',
                    icon: <Zap className="h-6 w-6" />,
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    count: '32 articles'
                  },
                  {
                    title: 'Market Analysis',
                    description: 'Trends and financial insights',
                    icon: <BarChart3 className="h-6 w-6" />,
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                    count: '28 articles'
                  },
                  {
                    title: 'Company Updates',
                    description: 'Corporate news and announcements',
                    icon: <Building2 className="h-6 w-6" />,
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                    count: '39 articles'
                  }
                ].map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main News Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
              <p className="text-muted-foreground">Stay updated with the most recent industry developments</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Live Updates
              </Badge>
            </div>
          </div>
          <NewsFeed showHeader={false} />
        </section>

        {/* Newsletter Subscription */}
        <section>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-0">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Stay Ahead of the Curve
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Get weekly insights, market analysis, and breaking news delivered directly to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 max-w-md px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button size="lg" className="px-8">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default NewsPage
