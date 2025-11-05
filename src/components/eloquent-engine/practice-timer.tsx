'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function PracticeTimer() {
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('5');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);
  
  const handleSetTime = () => {
    const newMinutes = parseInt(inputMinutes, 10);
    if (!isNaN(newMinutes) && newMinutes > 0 && newMinutes <= 999) {
      setInitialMinutes(newMinutes);
      setSeconds(newMinutes * 60);
      setIsActive(false);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Timer</CardTitle>
        <CardDescription>Time your speech to perfection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
            <p className="text-7xl font-bold font-mono text-primary" suppressHydrationWarning>
                {isClient ? formatTime(seconds) : '00:00'}
            </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => setIsActive(!isActive)} size="lg" className="w-32">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={reset} variant="outline" size="lg" className="w-32">
            <RotateCcw className="mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2 max-w-sm mx-auto pt-4">
            <Input 
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                placeholder="Minutes"
                aria-label="Set timer minutes"
                className="text-center"
            />
            <Button onClick={handleSetTime}>Set Time</Button>
        </div>
      </CardContent>
    </Card>
  );
}
