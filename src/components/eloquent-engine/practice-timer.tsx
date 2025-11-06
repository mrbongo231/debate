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
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);
  
  const handleSetTime = () => {
    const newMinutes = parseInt(inputMinutes, 10);
    if (!isNaN(newMinutes) && newMinutes > 0 && newMinutes <= 999) {
      setInitialMinutes(newMinutes);
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
      // Optionally, add a sound or notification here
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

  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">Practice Timer</CardTitle>
                <CardDescription>Time your delivery to perfection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center bg-muted/20 p-8 rounded-lg border border-border">
                    <p className="text-8xl font-bold font-mono text-primary">
                        {formatTime(initialMinutes * 60)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Practice Timer</CardTitle>
        <CardDescription>Time your delivery to perfection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center bg-muted/20 p-8 rounded-lg border border-border">
            <p className="text-8xl font-bold font-mono text-primary">
                {formatTime(seconds)}
            </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => setIsActive(!isActive)} size="lg" className="w-40" variant={isActive ? "secondary" : "default"}>
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={reset} variant="outline" size="lg" className="w-40">
            <RotateCcw className="mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2 max-w-sm mx-auto pt-4 border-t border-border">
            <Input 
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                placeholder="Set minutes"
                aria-label="Set timer minutes"
                className="text-center text-lg"
            />
            <Button onClick={handleSetTime}>Set Time</Button>
        </div>
      </CardContent>
    </Card>
  );
}
