import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import NewsFeed from '@/components/news/NewsFeed'

const NewsPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* News Feed */}
      <NewsFeed showHeader={false} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
          >
            ← Back to Home
          </Button>

          <Button
            onClick={() => navigate('/vehicles')}
            variant="outline"
            size="sm"
          >
            Browse Vehicles →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewsPage
