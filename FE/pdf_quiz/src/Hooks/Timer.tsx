import { useState, useEffect } from 'react';

const Timer= () => {
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(1);
    const [seconds, setSeconds] = useState<number>(0);

    useEffect(() => {
        const countdown = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds => seconds - 1);
            } else if (minutes > 0) {
                setMinutes(minutes => minutes - 1);
                setSeconds(59);
            } else if (hours > 0) {
                setHours(hours => hours - 1);
                setMinutes(59);
                setSeconds(59);
            } else {
                clearInterval(countdown);
                alert('Time is up!');
            }
        }, 1000);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(countdown);
    }, [seconds, minutes, hours]);
    return (
        <div>
            <h6>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</h6>
        </div>
    )
    

};


export default Timer;