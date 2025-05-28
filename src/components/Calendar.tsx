import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarComponent: React.FC = () => {
  const [value, setValue] = useState<Value>(new Date());

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    // Here you can add additional logic when a date is selected
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={value}
        className="custom-calendar"
      />
    </div>
  );
};

export default CalendarComponent; 