import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={reactLogo} className="h-24 w-24 animate-spin" alt="React logo" />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold mb-8">Vite + React + Tailwind + shadcn/ui</h1>
      
      <div className="grid gap-6 w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Counter Component</CardTitle>
            <CardDescription>Built with shadcn/ui Button component</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-2xl font-semibold text-gray-700">
              count is {count}
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCount((count) => count + 1)}>
                Increment
              </Button>
              <Button variant="outline" onClick={() => setCount(0)}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>Built with shadcn/ui Input and Label components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Type something:</Label>
              <Input
                id="input-demo"
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            {inputValue && (
              <div className="text-sm text-gray-600">
                You typed: <span className="font-medium">{inputValue}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Edit <code className="bg-gray-200 px-2 py-1 rounded text-sm">src/App.tsx</code> and save to test HMR</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              Click on the Vite and React logos to learn more
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
