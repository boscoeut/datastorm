import React from 'react'
import NewsFeed from '@/components/news/NewsFeed'
import FeaturedArticles from '@/components/news/FeaturedArticles'

const NewsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-8 lg:py-2 space-y-4 sm:space-y-6 lg:space-y-8">

        {/* Featured Articles */}
        <section>
          <FeaturedArticles articles={[]} />
        </section>

        {/* Main News Feed */}
        <section className="mt-2">
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
