import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Filter, 
  Calendar, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react'
import {
  useNewsArticles,
  useNewsLoading,
  useNewsError,
  useNewsSearchQuery,
  useNewsFilters,
  useNewsPagination,
  useNewsTotalCount,
  useNewsStore
} from '@/stores/news-store'


interface NewsFeedProps {
  showHeader?: boolean
  className?: string
}

const NewsFeed: React.FC<NewsFeedProps> = ({ showHeader = true, className = '' }) => {
  const articles = useNewsArticles()
  const loading = useNewsLoading()
  const error = useNewsError()
  const searchQuery = useNewsSearchQuery()
  const filters = useNewsFilters()
  const pagination = useNewsPagination()
  const totalCount = useNewsTotalCount()

  
  const {
    setSearchQuery,
    updateFilters,
    clearFilters,
    setPage,
    clearError
  } = useNewsStore()

  const [showFilters, setShowFilters] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Compute categories and tags locally to prevent infinite loops
  const categories = useMemo(() => {
    const cats = new Set<string>()
    articles.forEach(article => {
      if (article.category) {
        cats.add(article.category)
      }
    })
    return Array.from(cats).sort()
  }, [articles])

  const tags = useMemo(() => {
    const tagSet = new Set<string>()
    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [articles])

  // Initialize data when component mounts
  useEffect(() => {
    // Call fetchArticles directly from the store to avoid dependency issues
    useNewsStore.getState().fetchArticles()
  }, []) // Empty dependency array since we're calling store method directly

  // Update local search query when store changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleSearch = () => {
    setSearchQuery(localSearchQuery)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryFilter = (category: string) => {
    if (filters.category === category) {
      updateFilters({ category: undefined })
    } else {
      updateFilters({ category })
    }
  }

  const handleTagFilter = (tag: string) => {
    const currentTags = filters.tags || []
    let newTags: string[]
    
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter(t => t !== tag)
    } else {
      newTags = [...currentTags, tag]
    }
    
    updateFilters({ tags: newTags.length > 0 ? newTags : undefined })
  }

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

  const totalPages = Math.ceil(totalCount / pagination.pageSize)

  // Handle errors gracefully
  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={clearError} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">EV Industry News</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Latest updates, rumors, and insights from the electric vehicle industry
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {totalCount > 0 && (
              <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {totalCount} articles
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                <span className="hidden sm:inline">Loading...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              Search & Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="news-search" className="sr-only">
                Search news articles
              </Label>
              <Input
                id="news-search"
                placeholder="Search for news, rumors, or updates..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full text-sm sm:text-base"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={filters.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryFilter(category)}
                        className="text-xs"
                      >
                        {getCategoryIcon(category)}
                        <span className="ml-1">{category}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag}
                        variant={filters.tags?.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagFilter(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={Object.keys(filters).length === 0}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* News Articles */}
      <div className="space-y-3 sm:space-y-4">
        {articles.map((article) => (
          <Card 
            key={article.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (article.source_url) {
                window.open(article.source_url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-3 min-w-0">
                  {/* Article Header */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  {/* Article Metadata */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {article.category && (
                      <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                        {getCategoryIcon(article.category)}
                        <span className="ml-1">{article.category}</span>
                      </Badge>
                    )}
                    
                    {article.published_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatDate(article.published_date)}
                      </div>
                    )}
                    
                    {article.source_name && (
                      <span className="truncate">Source: {article.source_name}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-secondary/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagFilter(tag);
                          }}
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
                </div>

                {/* External Link */}
                {article.source_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shrink-0 w-full sm:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Read More
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No news articles found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for the latest updates'
                }
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {totalPages} ({totalCount} articles)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NewsFeed
