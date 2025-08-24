import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useComparisonVehicles, useCanAddToComparison, useVehicleStore } from '@/stores/vehicle-store'
import type { Vehicle } from '@/types/database'

interface ComparisonButtonProps {
  vehicle: Vehicle
  className?: string
}

const ComparisonButton: React.FC<ComparisonButtonProps> = ({ vehicle, className = '' }) => {
  const comparisonVehicles = useComparisonVehicles()
  const canAddToComparison = useCanAddToComparison()
  const { addToComparison, removeFromComparison } = useVehicleStore()
  
  const isInComparison = comparisonVehicles.some(v => v.id === vehicle.id)
  
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInComparison) {
      removeFromComparison(vehicle.id)
    } else {
      await addToComparison(vehicle)
    }
  }
  
  return (
    <Button
      variant={isInComparison ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={!isInComparison && !canAddToComparison}
      className={`${className} ${
        isInComparison 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : 'hover:bg-primary hover:text-primary-foreground'
      }`}
    >
      {isInComparison ? (
        <>
          <X className="h-4 w-4 mr-1" />
          Remove
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-1" />
          Compare
        </>
      )}
    </Button>
  )
}

export default ComparisonButton
