import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Share2,
  TrendingUp,
  Zap,
  AlertTriangle,
  Newspaper
} from 'lucide-react'
import type { NewsArticle } from '@/types/database'

interface FeaturedArticlesProps {
  articles: NewsArticle[]
  onArticleClick?: (article: NewsArticle) => void
}

const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({ 
  articles, 
  onArticleClick 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'industry news':
        return <Newspaper className="h-4 w-4" />
      case 'rumors':
        return <TrendingUp className="h-4 w-4" />
      case 'regulatory':
        return <AlertTriangle className="h-4 w-4" />
      case 'technology':
        return <Zap className="h-4 w-4" />
      default:
        return <Newspaper className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'industry news':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'rumors':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'regulatory':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'technology':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const estimateReadingTime = (summary: string) => {
    const wordsPerMinute = 200
    const wordCount = summary.split(' ').length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  if (!articles || articles.length === 0) {
    return null
  }

  // Get the first article as the main featured article
  const mainArticle = articles[0]
  const secondaryArticles = articles.slice(1, 4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Articles</h2>
          <p className="text-muted-foreground">Top stories and breaking news from the EV industry</p>
        </div>
        <Button variant="outline" size="sm">
          View All Featured
        </Button>
      </div>

      {/* Main Featured Article */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Article Content */}
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getCategoryColor(mainArticle.category || '')}>
                  {getCategoryIcon(mainArticle.category || '')}
                  <span className="ml-1">{mainArticle.category || 'News'}</span>
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {estimateReadingTime(mainArticle.summary || '')}
                </div>
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                {mainArticle.title}
              </h3>

              {mainArticle.summary && (
                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                  {mainArticle.summary}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {mainArticle.published_date && (
                    <span>{formatDate(mainArticle.published_date)}</span>
                  )}
                  {mainArticle.source_name && (
                    <span>Source: {mainArticle.source_name}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {mainArticle.source_url && (
                    <Button size="sm" asChild>
                      <a
                        href={mainArticle.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Read Full Article
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Newspaper className="h-12 w-12 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Featured Story</h4>
                <p className="text-sm text-muted-foreground">Industry Impact</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Featured Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaryArticles.map((article, index) => (
          <Card key={article.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              {/* Article Header */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={getCategoryColor(article.category || '')}>
                  {getCategoryIcon(article.category || '')}
                  <span className="ml-1">{article.category || 'News'}</span>
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {estimateReadingTime(article.summary || '')}
                </div>
              </div>

              {/* Article Title */}
              <h4 className="text-lg font-semibold text-foreground mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {article.title}
              </h4>

              {/* Article Summary */}
              {article.summary && (
                <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              )}

              {/* Article Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {article.published_date && (
                    <span>{formatDate(article.published_date)}</span>
                  )}
                  {article.source_name && (
                    <span>Source: {article.source_name}</span>
                  )}
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-secondary/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {article.source_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Read More
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FeaturedArticles
