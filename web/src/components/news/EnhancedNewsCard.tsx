import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Newspaper,
  Eye,
  MessageCircle
} from 'lucide-react'
import type { NewsArticle } from '@/types/database'

interface EnhancedNewsCardProps {
  article: NewsArticle
  isFeatured?: boolean
  onBookmark?: (article: NewsArticle) => void
  onShare?: (article: NewsArticle) => void
  onTagClick?: (tag: string) => void
}

const EnhancedNewsCard: React.FC<EnhancedNewsCardProps> = ({
  article,
  isFeatured = false,
  onBookmark,
  onShare,
  onTagClick
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      case 'rumors':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800'
      case 'regulatory':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'technology':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const estimateReadingTime = (summary: string) => {
    const wordsPerMinute = 200
    const wordCount = summary.split(' ').length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  const getPriorityColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'regulatory':
        return 'border-l-red-500'
      case 'technology':
        return 'border-l-green-500'
      case 'rumors':
        return 'border-l-orange-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 
      hover:shadow-lg hover:-translate-y-1 border-l-4
      ${getPriorityColor(article.category || '')}
      ${isFeatured ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
    `}>
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            Featured
          </Badge>
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative z-10 p-6">
        {/* Article Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`${getCategoryColor(article.category || '')} border`}>
                {getCategoryIcon(article.category || '')}
                <span className="ml-1">{article.category || 'News'}</span>
              </Badge>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {estimateReadingTime(article.summary || '')}
              </div>
            </div>

            <h3 className={`font-bold text-foreground leading-tight group-hover:text-blue-600 transition-colors duration-200 ${
              isFeatured ? 'text-xl' : 'text-lg'
            }`}>
              {article.title}
            </h3>
          </div>
        </div>

        {/* Article Summary */}
        {article.summary && (
          <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        )}

        {/* Article Metadata */}
        <div className="space-y-4">
          {/* Date and Source */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {article.published_date && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(article.published_date)}
                </span>
              )}
              {article.source_name && (
                <span className="font-medium">Source: {article.source_name}</span>
              )}
            </div>
            
            {/* Engagement Stats (Mock data) */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {Math.floor(Math.random() * 1000) + 100}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {Math.floor(Math.random() * 50) + 5}
              </span>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors duration-200"
                  onClick={() => onTagClick?.(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{article.tags.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                onClick={() => onBookmark?.(article)}
                title="Bookmark article"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/30"
                onClick={() => onShare?.(article)}
                title="Share article"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {article.source_url && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700"
              >
                <a
                  href={article.source_url}
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
      </CardContent>
    </Card>
  )
}

export default EnhancedNewsCard
