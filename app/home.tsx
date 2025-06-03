import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Alert,
  AppState,
  Image,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { format, isToday } from "date-fns";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Modern color palette
const COLORS = {
  primary: "#6C63FF",
  primaryDark: "#5A52E0",
  secondary: "#00C9B7",
  accent: "#FF6B6B",
  background: "#F8F9FF",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#666666",
  border: "#E0E0E0",
};

type Medication = {
  id: string;
  name: string;
  time: string;
  dosage: string;
  taken: boolean;
};

type QuickAction = {
  icon: string;
  label: string;
  route: string;
  color: string;
  gradient: [string, string];
  iconLib?: any;
};

type StatCardProps = {
  icon: string;
  value: string | number;
  label: string;
};

type MedicationCardProps = {
  medication: Medication;
  onToggle: () => void;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: "plus-circle",
    label: "Add\nMedication",
    route: "/medications/add",
    color: COLORS.accent,
    gradient: ["#FF6B6B", "#FF5252"],
    iconLib: MaterialCommunityIcons,
  },
  {
    icon: "calendar-month",
    label: "Calendar\nView",
    route: "/calendar",
    color: COLORS.primary,
    gradient: [COLORS.primary, COLORS.primaryDark],
    iconLib: MaterialIcons,
  },
  {
    icon: "favorite",
    label: "Cycle\nTracker",
    route: "/menstrual-tracker",
    color: COLORS.secondary,
    gradient: ["#00C9B7", "#00B0A0"],
    iconLib: MaterialIcons,
  },
  {
    icon: "history",
    label: "History\nLog",
    route: "/history",
    color: "#8F88FF",
    gradient: ["#8F88FF", "#7A74E0"],
    iconLib: MaterialIcons,
  },
];

const MOCK_STATS = {
  adherence: 85,
  nextRefill: 'In 5 days',
  upcomingAppointment: '2023-06-15T10:00:00',
};

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onToggle }) => (
  <View style={styles.doseCard}>
    <View style={[styles.doseBadge, { backgroundColor: medication.taken ? COLORS.primary + '20' : '#F0F0F0' }]}>
      <Ionicons 
        name="medical" 
        size={24} 
        color={medication.taken ? COLORS.primary : '#999'} 
      />
    </View>
    <View style={styles.doseInfo}>
      <Text style={styles.medicineName}>{medication.name}</Text>
      <Text style={styles.dosageInfo}>{medication.dosage}</Text>
      <View style={styles.doseTime}>
        <Ionicons name="time-outline" size={14} color="#999" />
        <Text style={styles.timeText}>{medication.time}</Text>
      </View>
    </View>
    <TouchableOpacity 
      onPress={onToggle}
      style={[
        styles.checkButton,
        medication.taken && styles.checkedButton
      ]}
    >
      <Ionicons 
        name={medication.taken ? "checkmark" : "add"} 
        size={20} 
        color={medication.taken ? COLORS.primary : "#fff"} 
      />
    </TouchableOpacity>
  </View>
);

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon as any} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CircularProgress: React.FC<{
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({
  progress = 0.75,
  size = 80,
  strokeWidth = 8,
  color = COLORS.primary
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [progress, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: size * 0.2, fontWeight: 'bold', color: COLORS.text }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([
    { id: '1', title: 'Medication Reminder', message: 'Time to take your medication', time: '2 min ago', read: false },
    { id: '2', title: 'Refill Alert', message: 'Your prescription is running low', time: '1 hour ago', read: true },
  ]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [medicationName, setMedicationName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [time, setTime] = useState<Date>(new Date());
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMedicationToggle = useCallback((id: string) => {
    setMedications(currentMeds => 
      currentMeds.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  }, []);

  const handleAddMedication = () => {
    if (medicationName.trim() && dosage.trim()) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: medicationName,
        time: format(time, 'HH:mm'),
        dosage,
        taken: false,
      };
      setMedications([...medications, newMed]);
      setMedicationName('');
      setDosage('');
      setShowAddModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header with greeting and stats */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good Morning</Text>
                <Text style={styles.userName}>John Doe</Text>
              </View>
              <TouchableOpacity 
                style={styles.notificationIcon}
                onPress={() => setShowNotifications(true)}
              >
                <Ionicons name="notifications-outline" size={24} color="white" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <CircularProgress progress={0.75} size={100} />
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressPercent}>75%</Text>
                <Text style={styles.progressLabel}>Medication Adherence</Text>
                <Text style={styles.progressSubtext}>3 of 4 taken today</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={() => router.push(action.route as any)}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionContent}>
                      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                        <action.iconLib name={action.icon} size={20} color="white" />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Today's Medications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Medications</Text>
              <TouchableOpacity onPress={() => setShowAddModal(true)}>
                <Text style={styles.seeAllText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.medicationsList}>
              {medications.length > 0 ? (
                medications.map(medication => (
                  <MedicationCard 
                    key={medication.id} 
                    medication={medication} 
                    onToggle={() => handleMedicationToggle(medication.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="medical-outline" size={48} color={COLORS.border} />
                  <Text style={styles.emptyStateText}>No medications scheduled</Text>
                  <Text style={styles.emptyStateSubtext}>Add a medication to get started</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Health Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Tips</Text>
            <View style={styles.tipCard}>
              <Ionicons name="water-outline" size={24} color={COLORS.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Stay Hydrated</Text>
                <Text style={styles.tipText}>
                  Drink at least 8 glasses of water daily to stay hydrated and maintain optimal body function.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ibuprofen"
                value={medicationName}
                onChangeText={setMedicationName}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 200mg"
                value={dosage}
                onChangeText={setDosage}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeText}>
                  {format(time, 'h:mm a')}
                </Text>
                <Ionicons name="time-outline" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>
            
            <TouchableOpacity
              style={[
                styles.button,
                (!medicationName || !dosage) && styles.buttonDisabled
              ]}
              onPress={handleAddMedication}
              disabled={!medicationName || !dosage}
            >
              <Text style={styles.buttonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationsList}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <View 
                    key={notification.id} 
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                  >
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color={COLORS.border}
                  />
                  <Text style={styles.emptyStateText}>No notifications</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
  },
  userName: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 15,
  },
  progressTextContainer: {
    marginLeft: 20,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  progressLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  progressSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: '48%',
    height: 100,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  medicationsList: {
    marginTop: 10,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  doseBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  doseInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dosageInfo: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  doseTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#F8F9FF',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default HomeScreen;
