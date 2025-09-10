import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import NewsFeed from '@/components/news/NewsFeed'
import FeaturedArticles from '@/components/news/FeaturedArticles'
import { 
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

const NewsPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Quick Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Button
            onClick={() => navigate('/vehicles')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            Browse Vehicles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Featured Articles */}
        <section>
          <FeaturedArticles articles={[]} />
        </section>

        {/* Main News Feed */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Latest News</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Stay updated with the most recent industry developments</p>
            </div>
          </div>
          <NewsFeed showHeader={false} />
        </section>
      </div>
    </div>
  )
}

export default NewsPage
