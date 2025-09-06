import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'
import { useComparisonCount, useMaxComparisonVehicles } from '@/stores/vehicle-store'

interface FloatingComparisonButtonProps {
  onToggleComparison: () => void
  isComparisonVisible: boolean
}

const FloatingComparisonButton: React.FC<FloatingComparisonButtonProps> = ({
  onToggleComparison
}) => {
  const comparisonCount = useComparisonCount()
  const maxComparisonVehicles = useMaxComparisonVehicles()

  if (comparisonCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onToggleComparison}
        size="lg"
        className="relative shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <BarChart3 className="h-5 w-5 mr-2" />
        Compare ({comparisonCount}/{maxComparisonVehicles})
        <Badge 
          variant="secondary" 
          className="ml-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {comparisonCount}
        </Badge>
      </Button>
    </div>
  )
}

export default FloatingComparisonButton
