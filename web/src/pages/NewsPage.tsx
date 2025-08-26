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
        </div>

        {/* Featured Articles */}
        <section>
          <FeaturedArticles articles={[]} />
        </section>

        {/* Main News Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
              <p className="text-muted-foreground">Stay updated with the most recent industry developments</p>
            </div>
          </div>
          <NewsFeed showHeader={false} />
        </section>
      </div>
    </div>
  )
}

export default NewsPage
