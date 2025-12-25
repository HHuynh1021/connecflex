// components/Countdown.tsx
import React, { useState, useEffect } from 'react';
import { HStack, Text, Box } from '@chakra-ui/react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
}

interface CountdownProps {
  targetDate: string | null;
  onExpire?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onExpire }) => {
  const calculateTimeLeft = (): TimeRemaining => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
    }

    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeLeft());

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear interval and trigger callback when expired
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (!targetDate || timeLeft.isExpired) {
    return (
      <Text color="red.500" fontWeight="bold" fontStyle="italic">
        Offer expired
      </Text>
    );
  }

  return (
    <HStack gap={2} flexWrap="wrap">
      {timeLeft.days > 0 && (
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" color="red.600">
            {timeLeft.days}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {timeLeft.days === 1 ? 'day' : 'days'}
          </Text>
        </Box>
      )}
      
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold" color="red.600">
          {String(timeLeft.hours).padStart(2, '0')}
        </Text>
        <Text fontSize="xs" color="gray.600">
          hours
        </Text>
      </Box>
      
      <Text fontSize="lg" fontWeight="bold">:</Text>
      
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold" color="red.600">
          {String(timeLeft.minutes).padStart(2, '0')}
        </Text>
        <Text fontSize="xs" color="gray.600">
          mins
        </Text>
      </Box>
      
      <Text fontSize="lg" fontWeight="bold">:</Text>
      
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold" color="red.600">
          {String(timeLeft.seconds).padStart(2, '0')}
        </Text>
        <Text fontSize="xs" color="gray.600">
          secs
        </Text>
      </Box>
    </HStack>
  );
};

export default Countdown;