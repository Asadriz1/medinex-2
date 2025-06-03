import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const WATER_GOAL = 2500; // 2.5L in ml
const WATER_AMOUNTS = [100, 200, 300, 400, 500];

const WaterTracker = () => {
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<{amount: number; time: string}[]>([]);

  const addWater = (amount: number) => {
    const newIntake = intake + amount;
    setIntake(newIntake);
    setHistory([
      { amount, time: new Date().toLocaleTimeString() },
      ...history,
    ].slice(0, 10)); // Keep last 10 entries
  };

  const removeLastEntry = () => {
    if (history.length > 0) {
      const lastAmount = history[0].amount;
      setIntake(prev => Math.max(0, prev - lastAmount));
      setHistory(prev => prev.slice(1));
    }
  };

  const getProgress = () => Math.min(100, (intake / WATER_GOAL) * 100);
  const getStatus = () => {
    const percent = getProgress();
    if (percent >= 100) return { text: 'Great job! 🎉', color: '#4CAF50' };
    if (percent >= 75) return { text: 'Almost there!', color: '#8BC34A' };
    if (percent >= 50) return { text: 'Halfway!', color: '#FFC107' };
    return { text: 'Keep going!', color: '#FF9800' };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.amount}>{intake}ml</Text>
        <Text style={styles.goal}>of {WATER_GOAL}ml</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgress()}%`, backgroundColor: status.color }
            ]} 
          />
        </View>
        <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
      </View>

      <View style={styles.quickAdd}>
        {WATER_AMOUNTS.map(amount => (
          <TouchableOpacity
            key={amount}
            style={styles.addButton}
            onPress={() => addWater(amount)}
          >
            <Text style={styles.addButtonText}>+{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Today's Intake</Text>
        {history.length > 0 ? (
          <>
            {history.map((entry, i) => (
              <View key={i} style={styles.historyItem}>
                <MaterialIcons name="opacity" size={20} color="#2196F3" />
                <Text style={styles.historyAmount}>+{entry.amount}ml</Text>
                <Text style={styles.historyTime}>{entry.time}</Text>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.undoButton}
              onPress={removeLastEntry}
            >
              <Text style={styles.undoText}>Undo Last</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>No entries yet</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9ff',
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  goal: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickAdd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  history: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyAmount: {
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  historyTime: {
    color: '#666',
  },
  undoButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  undoText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WaterTracker;
