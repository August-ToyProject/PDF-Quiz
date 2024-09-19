import { useState, useEffect } from "react";
import { useQuizContext } from "../context/QuizContext";

interface TimerProps {
  hour: number;
  minute: number;
}

const Timer = ({ hour, minute }: TimerProps) => {
  const [hours, setHours] = useState<number>(hour);
  const [minutes, setMinutes] = useState<number>(minute);
  const [seconds, setSeconds] = useState<number>(0);

  const { isTimerStarted } = useQuizContext();

  useEffect(() => {
    // hour와 minute이 변경될 때마다 상태를 초기화합니다.
    setHours(hour);
    setMinutes(minute);
    setSeconds(0);
  }, [hour, minute]);

  useEffect(() => {
    if (!isTimerStarted) return;

    if (isTimerStarted) {
      const countdown = setInterval(() => {
        if (seconds > 0) {
          setSeconds((seconds) => seconds - 1);
        } else if (minutes > 0) {
          setMinutes((minutes) => minutes - 1);
          setSeconds(59);
        } else if (hours > 0) {
          setHours((hours) => hours - 1);
          setMinutes(59);
          setSeconds(59);
        } else {
          clearInterval(countdown);
          alert("Time is up!");
        }
      }, 1000);

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(countdown);
    }
  }, [seconds, minutes, hours, isTimerStarted]);
  return (
    <div>
      <h6>
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </h6>
    </div>
  );
};

export default Timer;
