import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Medication } from '../../types';
import { MedicationStorage } from '../../utils/MedicationStorage';
import { useTheme } from '../../contexts/ThemeContext'; // Changed
import { Theme } from '../../constants/DynamicTheme'; // Changed

export default function MedicationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); // Added
  const { colors } = theme; // Removed unused typography and spacing
  const styles = createStyles(theme); // Added
  const { id } = useLocalSearchParams<{ id: string }>();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedication, setEditedMedication] = useState<Medication | null>(null);

  const loadMedication = React.useCallback(async () => {
    try {
      const medications = await MedicationStorage.getAllMedications();
      const found = medications.find(med => med.id === id);
      if (found) {
        setMedication(found);
        setEditedMedication(found);
      } else {
        Alert.alert('Error', 'Medication not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading medication:', error);
      Alert.alert('Error', 'Failed to load medication');
    }
  }, [id]);

  useEffect(() => {
    loadMedication();
  }, [loadMedication]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MedicationStorage.deleteMedication(id);
              Alert.alert('Success', 'Medication deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err) {
              console.error('Error deleting medication:', err);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!editedMedication) return;

    try {
      await MedicationStorage.updateMedication(id, editedMedication);
      setMedication(editedMedication);
      setIsEditing(false);
      Alert.alert('Success', 'Medication updated successfully');
    } catch (err) {
      console.error('Error updating medication:', err);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const handleMarkAsTaken = async () => {
    try {
      await MedicationStorage.markAsTaken(id);
      const updatedMed = { ...medication!, taken: true };
      setMedication(updatedMed);
      setEditedMedication(updatedMed);
      Alert.alert('Success', 'Medication marked as taken');
    } catch (err) {
      console.error('Error marking medication as taken:', err);
      Alert.alert('Error', 'Failed to update medication status');
    }
  };

  const getDaysUntilRefill = () => {
    if (!medication) return 0;
    const today = new Date();
    const refillDate = new Date(medication.refillDate);
    const diffTime = refillDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRefillStatus = () => {
    const days = getDaysUntilRefill();
    if (days < 0) return { text: 'Overdue', color: '#FF4444' };
    if (days <= 7) return { text: 'Due Soon', color: '#FF9500' };
    return { text: 'On Track', color: '#4CAF50' };
  };

  if (!medication) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </View>
    );
  }

  const refillStatus = getRefillStatus();

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.linearGradient, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medication Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medication Info Card */}
        <View style={[styles.medicationCard, { borderLeftColor: medication.color || colors.primary }]}>
          <View style={styles.medicationHeader}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedMedication?.name}
                onChangeText={(text) => setEditedMedication(prev => prev ? {...prev, name: text} : null)}
                placeholder="Medication name"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <Text style={styles.medicationName}>{medication.name}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: medication.taken ? colors.success : colors.warning }]}>
              <Text style={styles.statusText}>{medication.taken ? 'Taken' : 'Pending'}</Text>
            </View>
          </View>

          <View style={styles.medicationDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dosage:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputSmall}
                  value={editedMedication?.dosage}
                  onChangeText={(text) => setEditedMedication(prev => prev ? {...prev, dosage: text} : null)}
                  placeholder="Dosage"
                  placeholderTextColor={colors.placeholder}
                />
              ) : (
                <Text style={styles.detailValue}>{medication.dosage}</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Frequency:</Text>
              <Text style={styles.detailValue}>{medication.frequency}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Times:</Text>
              <Text style={styles.detailValue}>{medication.time.join(', ')}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pills Remaining:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInputSmall}
                  value={editedMedication?.pillsRemaining.toString()}
                  onChangeText={(text) => setEditedMedication(prev => prev ? {...prev, pillsRemaining: Number(text) || 0} : null)}
                  placeholder="Pills remaining"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.detailValue}>{medication.pillsRemaining}</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Refill Date:</Text>
              <Text style={styles.detailValue}>{new Date(medication.refillDate).toLocaleDateString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Refill Status:</Text>
              <Text style={[styles.detailValue, { color: refillStatus.color }]}>{refillStatus.text}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Days Until Refill:</Text>
              <Text style={styles.detailValue}>{getDaysUntilRefill()} days</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!medication.taken && (
                <TouchableOpacity style={styles.takeButton} onPress={handleMarkAsTaken}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.takeButtonText}>Mark as Taken</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash" size={20} color={colors.white} />
                <Text style={styles.deleteButtonText}>Delete Medication</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          <View style={styles.historyCard}>
            <Text style={styles.historyText}>Created: {new Date(medication.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.historyText}>Last Updated: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({ // Changed
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  linearGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, // Changed
    paddingVertical: theme.spacing.md, // Changed
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background, // Changed
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: theme.spacing.lg, // Changed
    paddingTop: theme.spacing.xl, // Changed
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSizes.lg, // Changed
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeights.semibold, // Changed
  },
  medicationCard: {
    backgroundColor: theme.colors.surface, // Changed
    borderRadius: 20,
    padding: theme.spacing.lg, // Changed
    marginBottom: theme.spacing.lg, // Changed
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: theme.colors.shadow.medium, // Changed
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg, // Changed
  },
  medicationName: {
    fontSize: theme.typography.fontSizes['2xl'], // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
    color: theme.colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md, // Changed
    paddingVertical: theme.spacing.sm, // Changed
    borderRadius: 20,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.xs, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  medicationDetails: {
    gap: theme.spacing.md, // Changed
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs, // Changed
  },
  detailLabel: {
    fontSize: theme.typography.fontSizes.base, // Changed
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.semibold, // Changed
  },
  detailValue: {
    fontSize: theme.typography.fontSizes.base, // Changed
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  editInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes['2xl'], // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
    color: theme.colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm, // Changed
    marginRight: theme.spacing.md, // Changed
  },
  editInputSmall: {
    fontSize: theme.typography.fontSizes.base, // Changed
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeights.bold, // Changed
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs, // Changed
    minWidth: 100,
    textAlign: 'right',
  },
  actionButtons: {
    gap: theme.spacing.md, // Changed
    marginBottom: theme.spacing.xl, // Changed
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg, // Changed
    paddingHorizontal: theme.spacing.xl, // Changed
    borderRadius: theme.spacing.md, // Changed
    gap: theme.spacing.md, // Changed
    elevation: 3,
    shadowColor: theme.colors.shadow.medium, // Changed
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.lg, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary, // Changed
    paddingVertical: theme.spacing.lg, // Changed
    paddingHorizontal: theme.spacing.xl, // Changed
    borderRadius: theme.spacing.md, // Changed
    gap: theme.spacing.md, // Changed
    borderWidth: 1,
    borderColor: theme.colors.border, // Changed
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.lg, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary, // Changed
    paddingVertical: theme.spacing.lg, // Changed
    paddingHorizontal: theme.spacing.xl, // Changed
    borderRadius: theme.spacing.md, // Changed
    gap: theme.spacing.md, // Changed
    elevation: 3,
    shadowColor: theme.colors.shadow.medium, // Changed
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  takeButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.lg, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error, // Changed
    paddingVertical: theme.spacing.lg, // Changed
    paddingHorizontal: theme.spacing.xl, // Changed
    borderRadius: theme.spacing.md, // Changed
    gap: theme.spacing.md, // Changed
    elevation: 3,
    shadowColor: theme.colors.shadow.medium, // Changed
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.lg, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
  },
  historySection: {
    marginTop: theme.spacing.lg, // Changed
    marginBottom: theme.spacing.xl, // Changed
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl, // Changed
    fontWeight: theme.typography.fontWeights.bold, // Changed
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md, // Changed
  },
  historyCard: {
    backgroundColor: theme.colors.surface, // Changed
    borderRadius: theme.spacing.md, // Changed
    padding: theme.spacing.lg, // Changed
    elevation: 2,
    shadowColor: theme.colors.shadow.light, // Changed
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  historyText: {
    fontSize: theme.typography.fontSizes.base, // Changed
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm, // Changed
  },
});
