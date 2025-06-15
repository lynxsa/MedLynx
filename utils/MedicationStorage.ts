import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  refillDate: string;
  pillsRemaining: number;
  color: string;
  taken: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'medications';

export const MedicationStorage = {
  // Get all medications
  async getAllMedications(): Promise<Medication[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  },

  // Save a new medication
  async saveMedication(medication: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication | null> {
    try {
      const existing = await this.getAllMedications();
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      existing.push(newMedication);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return newMedication;
    } catch (error) {
      console.error('Error saving medication:', error);
      return null;
    }
  },

  // Update an existing medication
  async updateMedication(id: string, updates: Partial<Medication>): Promise<boolean> {
    try {
      const medications = await this.getAllMedications();
      const index = medications.findIndex(med => med.id === id);
      
      if (index === -1) return false;
      
      medications[index] = { ...medications[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
      return true;
    } catch (error) {
      console.error('Error updating medication:', error);
      return false;
    }
  },

  // Delete a medication
  async deleteMedication(id: string): Promise<boolean> {
    try {
      const medications = await this.getAllMedications();
      const filtered = medications.filter(med => med.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting medication:', error);
      return false;
    }
  },

  // Mark medication as taken for today
  async markAsTaken(id: string): Promise<boolean> {
    return this.updateMedication(id, { taken: true });
  },

  // Reset daily status (should be called daily)
  async resetDailyStatus(): Promise<boolean> {
    try {
      const medications = await this.getAllMedications();
      const reset = medications.map(med => ({ ...med, taken: false }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return true;
    } catch (error) {
      console.error('Error resetting daily status:', error);
      return false;
    }
  },

  // Clear all data
  async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  // Get medications that need refill soon (within 7 days)
  async getMedicationsNeedingRefill(): Promise<Medication[]> {
    try {
      const medications = await this.getAllMedications();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      return medications.filter(med => {
        const refillDate = new Date(med.refillDate);
        return refillDate <= sevenDaysFromNow || med.pillsRemaining <= 5;
      });
    } catch (error) {
      console.error('Error getting medications needing refill:', error);
      return [];
    }
  },

  // Get today's progress
  async getTodayProgress(): Promise<{ taken: number; total: number; percentage: number }> {
    try {
      const medications = await this.getAllMedications();
      const total = medications.reduce((sum, med) => sum + med.time.length, 0);
      const taken = medications.reduce((sum, med) => sum + (med.taken ? med.time.length : 0), 0);
      const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
      
      return { taken, total, percentage };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { taken: 0, total: 0, percentage: 0 };
    }
  }
};

export default MedicationStorage;
