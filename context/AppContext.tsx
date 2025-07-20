import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { DailyProgress, Medication } from '../types';
import { EnhancedNotificationService } from '../utils/EnhancedNotificationService';
import { MedicationStorage } from '../utils/MedicationStorage';

interface AppState {
  medications: Medication[];
  todayProgress: DailyProgress;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MEDICATIONS'; payload: Medication[] }
  | { type: 'SET_PROGRESS'; payload: DailyProgress }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_MEDICATION'; payload: { id: string; updates: Partial<Medication> } }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'REMOVE_MEDICATION'; payload: string }
  | { type: 'MARK_TAKEN'; payload: string }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

const initialState: AppState = {
  medications: [],
  todayProgress: { taken: 0, total: 0, percentage: 0 },
  loading: true,
  error: null,
  lastUpdated: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_MEDICATIONS':
      return { 
        ...state, 
        medications: action.payload,
        lastUpdated: new Date()
      };
    
    case 'SET_PROGRESS':
      return { ...state, todayProgress: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(med =>
          med.id === action.payload.id 
            ? { ...med, ...action.payload.updates }
            : med
        ),
        lastUpdated: new Date()
      };
    
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload],
        lastUpdated: new Date()
      };
    
    case 'REMOVE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(med => med.id !== action.payload),
        lastUpdated: new Date()
      };
    
    case 'MARK_TAKEN':
      return {
        ...state,
        medications: state.medications.map(med =>
          med.id === action.payload ? { ...med, taken: true } : med
        ),
        lastUpdated: new Date()
      };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  loadMedications: () => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<boolean>;
  deleteMedication: (id: string) => Promise<boolean>;
  markAsTaken: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  calculateProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const calculateProgress = React.useCallback(() => {
    const total = state.medications.reduce((sum, med) => sum + med.time.length, 0);
    const taken = state.medications.reduce((sum, med) => sum + (med.taken ? med.time.length : 0), 0);
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
    
    dispatch({ type: 'SET_PROGRESS', payload: { taken, total, percentage } });
  }, [state.medications]);

  const loadMedications = React.useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const medications = await MedicationStorage.getAllMedications();
      dispatch({ type: 'SET_MEDICATIONS', payload: medications });
    } catch (error) {
      console.error('Error loading medications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load medications' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addMedication = React.useCallback(async (medicationData: Omit<Medication, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const success = await MedicationStorage.saveMedication(medicationData);
      if (success) {
        await loadMedications(); // Reload to get the new medication with ID
        
        // Schedule notifications for the new medication
        const medications = await MedicationStorage.getAllMedications();
        const newMedication = medications[medications.length - 1]; // Get the latest added
        // Create medication reminder for the enhanced service
        const reminder = {
          id: newMedication.id,
          medicationName: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          times: newMedication.time,
          time: newMedication.time[0], // First time for backward compatibility
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily by default
          startDate: new Date(),
          instructions: `Take ${newMedication.dosage}`,
          isActive: true,
        };
        await EnhancedNotificationService.scheduleMedicationReminder(reminder);
      }
      return success !== null; // Convert to boolean
    } catch (error) {
      console.error('Error adding medication:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add medication' });
      return false;
    }
  }, [loadMedications]);

  const updateMedication = React.useCallback(async (id: string, updates: Partial<Medication>): Promise<boolean> => {
    try {
      const success = await MedicationStorage.updateMedication(id, updates);
      if (success) {
        dispatch({ type: 'UPDATE_MEDICATION', payload: { id, updates } });
        
        // Reschedule notifications if times changed
        if (updates.time) {
          await EnhancedNotificationService.cancelMedicationReminder(id);
          const medication = state.medications.find(med => med.id === id);
          if (medication) {
            const updatedMed = { ...medication, ...updates };
            const reminder = {
              id: updatedMed.id,
              medicationName: updatedMed.name,
              dosage: updatedMed.dosage,
              frequency: updatedMed.frequency,
              times: updatedMed.time,
              time: updatedMed.time[0], // First time for backward compatibility
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily by default
              startDate: new Date(),
              instructions: `Take ${updatedMed.dosage}`,
              isActive: true,
            };
            await EnhancedNotificationService.scheduleMedicationReminder(reminder);
          }
        }
      }
      return success;
    } catch (error) {
      console.error('Error updating medication:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update medication' });
      return false;
    }
  }, [state.medications]);

  const deleteMedication = React.useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await MedicationStorage.deleteMedication(id);
      if (success) {
        dispatch({ type: 'REMOVE_MEDICATION', payload: id });
        await EnhancedNotificationService.cancelMedicationReminder(id);
      }
      return success;
    } catch (error) {
      console.error('Error deleting medication:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete medication' });
      return false;
    }
  }, []);

  const markAsTaken = React.useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await MedicationStorage.markAsTaken(id);
      if (success) {
        dispatch({ type: 'MARK_TAKEN', payload: id });
        
        // Send confirmation notification
        const medication = state.medications.find(med => med.id === id);
        if (medication) {
          // TODO: Implement immediate notification with EnhancedNotificationService
          console.log(`Medication taken: ${medication.name}`);
        }
      }
      return success;
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update medication status' });
      return false;
    }
  }, [state.medications]);

  const refreshData = React.useCallback(async () => {
    await loadMedications();
  }, [loadMedications]);

  // Calculate progress when medications change
  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  // Load medications on mount
  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Setup notification action handlers
  useEffect(() => {
    // Initialize the enhanced notification service handlers
    EnhancedNotificationService.setupNotificationActionHandlers();
  }, []);

  const contextValue: AppContextType = {
    ...state,
    loadMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    markAsTaken,
    refreshData,
    calculateProgress
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppProvider;
