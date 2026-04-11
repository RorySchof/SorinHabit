import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WeekStrip: React.FC<Props> = ({ selectedDate, onSelectDate }) => {
  const startOfWeek = dayjs(selectedDate).startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const dateStr = day.format('YYYY-MM-DD');
        const isSelected = dateStr === selectedDate;

        return (
          <TouchableOpacity key={dateStr} onPress={() => onSelectDate(dateStr)} style={styles.dayContainer}>
            <Text style={[styles.dayText, isSelected && styles.selectedText]}>
              {day.format('ddd')}
            </Text>
            <Text style={[styles.dateText, isSelected && styles.selectedText]}>
              {day.format('D')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#555',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedText: {
    color: '#304FFE',
  },
});

export default WeekStrip;
