import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Removed unused useMemo
import { useTranslation } from 'react-i18next';
import {
    // TextInput, // Removed unused import
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    // Text, // Removed unused import
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedButton from '../../components/ThemedButton';
import ThemedInput from '../../components/ThemedInput';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useTheme } from '../../contexts/ThemeContext'; // Corrected import and usage
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface PrescriptionUpload {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'processing' | 'ready' | 'fulfilled';
  prescriptionType: 'image' | 'pdf';
  prescribedBy: string;
  medications: string[];
  pharmacy?: string;
  estimatedCost?: number;
  uri: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  deliveryAvailable: boolean;
  operatingHours: string;
  specialServices: string[];
  estimatedTime: string;
}

const samplePharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Clicks Pharmacy',
    address: 'Sandton City Shopping Centre, Johannesburg',
    phone: '+27 11 217 0000',
    distance: 1.2,
    rating: 4.5,
    deliveryAvailable: true,
    operatingHours: '08:00 - 20:00',
    specialServices: ['Chronic Medication', 'Vaccination', 'Health Screening'],
    estimatedTime: '30 min'
  },
  {
    id: '2',
    name: 'Dischem Pharmacy',
    address: 'Mall of Africa, Midrand',
    phone: '+27 11 549 2000',
    distance: 2.1,
    rating: 4.3,
    deliveryAvailable: true,
    operatingHours: '08:00 - 21:00',
    specialServices: ['Baby Clinic', 'Chronic Medication', 'Beauty Services'],
    estimatedTime: '45 min'
  },
  {
    id: '3',
    name: 'Medirite Pharmacy',
    address: 'Rosebank Mall, Johannesburg',
    phone: '+27 11 447 9600',
    distance: 0.8,
    rating: 4.7,
    deliveryAvailable: false,
    operatingHours: '08:30 - 19:00',
    specialServices: ['Compounding', 'Medical Equipment', 'Home Care'],
    estimatedTime: '20 min'
  },
  {
    id: '4',
    name: 'Independent Pharmacy',
    address: 'Melville Medical Centre, Johannesburg',
    phone: '+27 11 726 1234',
    distance: 3.2,
    rating: 4.8,
    deliveryAvailable: true,
    operatingHours: '07:30 - 18:00',
    specialServices: ['Personal Service', 'Insurance Claims', 'Medicine Reviews'],
    estimatedTime: '60 min'
  }
];

export default function PrescriptionRefillsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme(); // Corrected usage
  const styles = useThemedStyles(getStyles);

  const [prescriptions, setPrescriptions] = useState<PrescriptionUpload[]>([]);
  const [selectedTab, setSelectedTab] = useState<'upload' | 'track' | 'pharmacy'>('upload');
  // const [modalVisible, setModalVisible] = useState(false); // Commented out - modal not implemented yet
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyModalVisible, setPharmacyModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [choosePharmacyModalVisible, setChoosePharmacyModalVisible] = useState(false);
  const [currentPrescriptionForPharmacyChoice, setCurrentPrescriptionForPharmacyChoice] = useState<PrescriptionUpload | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    // In a real app, this would load from storage or API
    const samplePrescriptions: PrescriptionUpload[] = [
      {
        id: '1',
        fileName: 'prescription_20241201.jpg',
        uploadDate: '2024-12-01',
        status: 'ready',
        prescriptionType: 'image',
        prescribedBy: 'Dr. Smith',
        medications: ['Metformin 500mg', 'Lisinopril 10mg'],
        pharmacy: 'Clicks Pharmacy',
        estimatedCost: 285.50,
        uri: 'mock://prescription1.jpg'
      },
      {
        id: '2',
        fileName: 'prescription_20241125.pdf',
        uploadDate: '2024-11-25',
        status: 'fulfilled',
        prescriptionType: 'pdf',
        prescribedBy: 'Dr. Johnson',
        medications: ['Aspirin 75mg', 'Atorvastatin 20mg'],
        pharmacy: 'Dischem Pharmacy',
        estimatedCost: 156.75,
        uri: 'mock://prescription2.pdf'
      }
    ];
    setPrescriptions(samplePrescriptions);
  };

  const handleUploadPrescription = () => {
    Alert.alert(
      'Upload Prescription',
      'Choose how you want to upload your prescription',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => uploadFromCamera() },
        { text: 'Choose File', onPress: () => uploadFromFiles() }
      ]
    );
  };

  const uploadFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processPrescriptionUpload(result.assets[0].uri, 'image');
    }
  };

  const uploadFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileType = result.assets[0].mimeType?.includes('pdf') ? 'pdf' : 'image';
        await processPrescriptionUpload(result.assets[0].uri, fileType);
      }
    } catch (err) {
      console.error('Error selecting file:', err);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const processPrescriptionUpload = async (uri: string, type: 'image' | 'pdf') => {
    setUploadProgress(true);
    
    // Simulate upload and processing
    // Ensure a unique ID for the new prescription
    const newPrescription: PrescriptionUpload = {
      id: `presc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: `prescription_${new Date().toISOString().split('T')[0]}.${type === 'pdf' ? 'pdf' : 'jpg'}`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'processing',
      prescriptionType: type,
      prescribedBy: 'Dr. Unknown',
      medications: [],
      uri: uri
    };

    setPrescriptions(prev => [newPrescription, ...prev]);
    
    // Simulate processing time
    setTimeout(() => {
      setPrescriptions(prev => 
        prev.map(p => 
          p.id === newPrescription.id 
            ? { ...p, status: 'ready' as const, medications: ['Medication processing...'] }
            : p
        )
      );
      setUploadProgress(false);
      Alert.alert('Success', 'Prescription uploaded and processed successfully!');
    }, 3000);
  };

  const handlePharmacySelect = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setPharmacyModalVisible(true);
  };

  const orderFromPharmacy = (prescriptionId: string, pharmacy: Pharmacy) => {
    Alert.alert(
      'Order Confirmation',
      `Order prescription from ${pharmacy.name}?\n\nEstimated ready time: ${pharmacy.estimatedTime}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Order', 
          onPress: () => {
            setPrescriptions(prev =>
              prev.map(p =>
                p.id === prescriptionId
                  ? { ...p, status: 'pending' as const, pharmacy: pharmacy.name }
                  : p
              )
            );
            setPharmacyModalVisible(false);
            Alert.alert('Order Placed', `Your prescription has been sent to ${pharmacy.name}`);
          }
        }
      ]
    );
  };

  const callPharmacy = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'processing': return theme.colors.info;
      case 'ready': return theme.colors.success;
      case 'fulfilled': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'processing': return 'sync-outline';
      case 'ready': return 'checkmark-circle-outline';
      case 'fulfilled': return 'checkmark-done-outline';
      default: return 'document-outline';
    }
  };

  const filteredPharmacies = samplePharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChoosePharmacyModal = (prescription: PrescriptionUpload) => {
    setCurrentPrescriptionForPharmacyChoice(prescription);
    setChoosePharmacyModalVisible(true);
  };

  const handleSelectPharmacyForPrescription = (pharmacy: Pharmacy) => {
    if (currentPrescriptionForPharmacyChoice) {
      orderFromPharmacy(currentPrescriptionForPharmacyChoice.id, pharmacy);
    }
    setChoosePharmacyModalVisible(false);
    setCurrentPrescriptionForPharmacyChoice(null);
  };

  const renderPrescriptionCard = (prescription: PrescriptionUpload) => (
    <ThemedView style={styles.prescriptionCard} key={prescription.id}>
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionInfo}>
          <ThemedText style={styles.prescriptionFileName} type="subtitle">{prescription.fileName}</ThemedText>
          <ThemedText style={styles.prescriptionDate} type="caption">
            Uploaded: {new Date(prescription.uploadDate).toLocaleDateString()}
          </ThemedText>
          {prescription.prescribedBy && (
            <ThemedText style={styles.prescribedBy} type="caption">By: {prescription.prescribedBy}</ThemedText>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) }]}>
          <Ionicons 
            name={getStatusIcon(prescription.status) as any} 
            size={16} 
            color={theme.colors.white} 
          />
          <ThemedText style={styles.statusText} type="caption" lightColor={theme.colors.white} darkColor={theme.colors.white}>{prescription.status.toUpperCase()}</ThemedText>
        </View>
      </View>

      {prescription.medications.length > 0 && (
        <View style={styles.medicationsSection}>
          <ThemedText style={styles.medicationsTitle} type="defaultSemiBold">Medications:</ThemedText>
          {prescription.medications.map((med, index) => (
            <ThemedText key={index} style={styles.medicationItem} type="default">• {med}</ThemedText>
          ))}
        </View>
      )}

      {prescription.pharmacy && (
        <View style={styles.pharmacyInfo}>
          <Ionicons name="business" size={16} color={theme.colors.primary} />
          <ThemedText style={styles.prescriptionPharmacyName} type="default">{prescription.pharmacy}</ThemedText>
          {prescription.estimatedCost && (
            <ThemedText style={styles.estimatedCost} type="caption">~R{prescription.estimatedCost.toFixed(2)}</ThemedText>
          )}
        </View>
      )}

      <View style={styles.prescriptionActions}>
        {prescription.status === 'ready' && (
          <ThemedButton
            title="Choose Pharmacy"
            style={styles.actionButton}
            onPress={() => handleOpenChoosePharmacyModal(prescription)} // Updated onPress
            variant="outline"
            icon="storefront"
            textStyle={styles.actionButtonText}
          />
        )}
        {prescription.status === 'pending' && prescription.pharmacy && (
          <ThemedButton
            title="Track Order" // Added title prop
            style={styles.trackButton}
            onPress={() => Alert.alert('Tracking', `Your prescription is being prepared at ${prescription.pharmacy}`)}
            variant="outline"
            icon="location" // Added icon prop
            textStyle={styles.trackButtonText} // Pass textStyle to ThemedButton
          />
        )}
      </View>
    </ThemedView>
  );

  const renderPharmacyListItemForModal = ({ item }: { item: Pharmacy }) => (
    <TouchableOpacity
      style={styles.pharmacyListItemModal}
      onPress={() => handleSelectPharmacyForPrescription(item)}
    >
      <View style={styles.pharmacyListItemModalContent}>
        <Ionicons name="storefront-outline" size={24} color={theme.colors.primary} style={styles.pharmacyListItemIconModal} />
        <View style={styles.pharmacyListItemTextContainerModal}>
          <ThemedText style={styles.pharmacyNameModal} type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.pharmacyAddressModal} type="caption">{item.address}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );


  const renderPharmacyCard = (pharmacy: Pharmacy) => (
    <TouchableOpacity 
      key={pharmacy.id}
      style={styles.pharmacyCard}
      onPress={() => handlePharmacySelect(pharmacy)}
    >
      <ThemedView style={styles.pharmacyCardInner}>
        <View style={styles.pharmacyHeader}>
          <View style={styles.pharmacyMainInfo}>
            <ThemedText style={styles.pharmacyCardTitle} type="subtitle">{pharmacy.name}</ThemedText>
            <ThemedText style={styles.pharmacyAddress} type="caption">{pharmacy.address}</ThemedText>
            <View style={styles.pharmacyMeta}>
              <View style={styles.pharmacyMetaItem}>
                <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                <ThemedText style={styles.pharmacyMetaText} type="caption">{pharmacy.distance}km away</ThemedText>
              </View>
              <View style={styles.pharmacyMetaItem}>
                <Ionicons name="star" size={14} color={theme.colors.warning} />
                <ThemedText style={styles.pharmacyMetaText} type="caption">{pharmacy.rating}</ThemedText>
              </View>
              <View style={styles.pharmacyMetaItem}>
                <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                <ThemedText style={styles.pharmacyMetaText} type="caption">{pharmacy.estimatedTime}</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.pharmacyActions}>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => callPharmacy(pharmacy.phone)}
            >
              <Ionicons name="call" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pharmacyServices}>
          {pharmacy.specialServices.slice(0, 3).map((service, index) => (
            <ThemedView key={index} style={styles.serviceTag}>
              <ThemedText style={styles.serviceTagText} type="caption">{service}</ThemedText>
            </ThemedView>
          ))}
          {pharmacy.deliveryAvailable && (
            <ThemedView style={styles.serviceTagDelivery}>
              <Ionicons name="bicycle" size={14} color={theme.colors.success} style={{marginRight: 4}}/>
              <ThemedText style={styles.serviceTagText} type="caption">Delivery Available</ThemedText>
            </ThemedView>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={theme.gradients.primary} // Corrected: theme.gradients.primary
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} type="title" lightColor={theme.colors.white} darkColor={theme.colors.white}>Prescription Refills</ThemedText>
          <TouchableOpacity onPress={handleUploadPrescription}>
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['upload', 'track', 'pharmacy'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <ThemedText style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]} type="defaultSemiBold" lightColor={selectedTab === tab ? theme.colors.primary : theme.colors.textSecondary} darkColor={selectedTab === tab ? theme.colors.primary : theme.colors.textSecondary}>
                {tab === 'upload' ? t('prescriptionRefills.upload') : tab === 'track' ? t('prescriptionRefills.track') : t('prescriptionRefills.pharmacy')}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'upload' && (
          <ThemedView style={styles.tabContent}>
            <View style={styles.uploadSection}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUploadPrescription}
              >
                <Ionicons name="cloud-upload" size={48} color={theme.colors.primary} />
                <ThemedText style={styles.uploadTitle} type="subtitle">{t('prescriptionRefills.uploadNew')}</ThemedText>
                <ThemedText style={styles.uploadSubtitle} type="caption">
                  {t('prescriptionRefills.uploadInstructions')}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {uploadProgress && (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <ThemedText style={styles.progressText} type="default">{t('prescriptionRefills.processing')}</ThemedText>
              </View>
            )}

            <ThemedView style={styles.instructionsCard}>
              <ThemedText style={styles.instructionsTitle} type="defaultSemiBold">{t('prescriptionRefills.uploadGuidelines')}</ThemedText>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <ThemedText style={styles.instructionText} type="default">{t('prescriptionRefills.guideline1')}</ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <ThemedText style={styles.instructionText} type="default">{t('prescriptionRefills.guideline2')}</ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <ThemedText style={styles.instructionText} type="default">{t('prescriptionRefills.guideline3')}</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>
        )}

        {selectedTab === 'track' && (
          <ThemedView style={styles.tabContent}>
            {prescriptions.length > 0 ? (
              prescriptions.map(renderPrescriptionCard)
            ) : (
              <ThemedView style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={theme.colors.textTertiary} /> 
                <ThemedText style={styles.emptyTitle} type="title">{t('prescriptionRefills.noPrescriptions')}</ThemedText>
                <ThemedText style={styles.emptySubtitle} type="default">
                  {t('prescriptionRefills.uploadFirst')}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {selectedTab === 'pharmacy' && (
          <ThemedView style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.placeholder} /> 
              <ThemedInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('prescriptionRefills.searchPharmacies')}
                placeholderTextColor={theme.colors.placeholder} 
              />
            </View>
            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map(renderPharmacyCard)
            ) : (
              <ThemedView style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={64} color={theme.colors.textTertiary} /> 
                <ThemedText style={styles.emptyTitle} type="title">{t('prescriptionRefills.noPharmaciesFound')}</ThemedText>
                <ThemedText style={styles.emptySubtitle} type="default">
                  {t('prescriptionRefills.tryDifferentSearch')}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ScrollView>

      {/* Pharmacy Detail Modal (existing) */}
      {selectedPharmacy && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={pharmacyModalVisible}
          onRequestClose={() => setPharmacyModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle} type="title">{selectedPharmacy.name}</ThemedText>
                <TouchableOpacity onPress={() => setPharmacyModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={30} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.detailText}><Ionicons name="map-outline" size={16} /> {selectedPharmacy.address}</ThemedText>
              <ThemedText style={styles.detailText}><Ionicons name="call-outline" size={16} /> {selectedPharmacy.phone}</ThemedText>
              <ThemedText style={styles.detailText}><Ionicons name="time-outline" size={16} /> Hours: {selectedPharmacy.operatingHours}</ThemedText>
              <ThemedText style={styles.detailText}><Ionicons name="star-outline" size={16} /> Rating: {selectedPharmacy.rating} / 5</ThemedText>
              {selectedPharmacy.deliveryAvailable && <ThemedText style={styles.detailText}><Ionicons name="bicycle-outline" size={16} color={theme.colors.success} /> Delivery Available</ThemedText>}
              
              <ThemedText style={styles.servicesTitle} type="defaultSemiBold">Services:</ThemedText>
              {selectedPharmacy.specialServices.map(service => (
                <ThemedText key={service} style={styles.serviceItem}>• {service}</ThemedText>
              ))}

              <View style={styles.modalActions}>
                <ThemedButton 
                  title="Call Pharmacy" 
                  onPress={() => callPharmacy(selectedPharmacy.phone)} 
                  icon="call"
                  style={styles.modalButton}
                />
                {/* This button's onPress needs to be aware of which prescription to order if any */}
                <ThemedButton 
                  title="Order from this Pharmacy" 
                  onPress={() => {
                    // Check if there's a prescription selected via the "Choose Pharmacy" flow
                    if (currentPrescriptionForPharmacyChoice) {
                      orderFromPharmacy(currentPrescriptionForPharmacyChoice.id, selectedPharmacy);
                      setCurrentPrescriptionForPharmacyChoice(null); // Reset after ordering
                    } else {
                      // If no specific prescription was being assigned, prompt or disable
                      Alert.alert("No Prescription Selected", "Please select a prescription to order or use the 'Choose Pharmacy' option on a ready prescription.");
                    }
                  }} 
                  icon="cart"
                  variant='primary'
                  style={styles.modalButton}
                  disabled={!currentPrescriptionForPharmacyChoice && prescriptions.filter(p=> p.status === 'ready').length === 0} // Disable if no prescription is being assigned AND no ready prescriptions exist
                />
              </View>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}

      {/* Choose Pharmacy for Prescription Modal (New) */}
      {currentPrescriptionForPharmacyChoice && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={choosePharmacyModalVisible}
          onRequestClose={() => {
            setChoosePharmacyModalVisible(false);
            setCurrentPrescriptionForPharmacyChoice(null);
          }}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle} type="title">Select Pharmacy for Prescription</ThemedText>
                <TouchableOpacity 
                  onPress={() => {
                    setChoosePharmacyModalVisible(false);
                    setCurrentPrescriptionForPharmacyChoice(null);
                  }} 
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={30} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ThemedInput
                placeholder="Search Pharmacies..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon="search-outline"
                style={styles.pharmacySearchInputModal} // Corrected prop to 'style'
              />
              <FlatList
                data={filteredPharmacies}
                renderItem={renderPharmacyListItemForModal}
                keyExtractor={(item) => item.id}
                style={styles.pharmacyListModal}
                ListEmptyComponent={<ThemedText style={styles.emptyListText}>No pharmacies found.</ThemedText>}
              />
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </ThemedView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({ // Use Theme type from DynamicTheme
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primaryMuted,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressText: {
    marginTop: 8,
  },
  instructionsCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  prescriptionCard: {
    backgroundColor: theme.colors.card.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionFileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  prescriptionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  prescribedBy: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  medicationsSection: {
    marginTop: 8,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  medicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationItem: {
    fontSize: 14,
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  prescriptionPharmacyName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  estimatedCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  prescriptionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    // fontSize: 14, // Example: Adjust font size if needed
    // fontWeight: '600', // Example: Adjust font weight if needed
    color: theme.colors.primary, // Ensure text color matches outline button style
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trackButtonText: {
    color: theme.colors.info, // Moved from ThemedText to here
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  pharmacyCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.card.background,
    shadowColor: theme.colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  pharmacyCardInner: {
    padding: 16,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pharmacyMainInfo: {
    flex: 1,
  },
  pharmacyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pharmacyAddress: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  pharmacyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pharmacyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  pharmacyMetaText: {
    marginLeft: 4,
    fontSize: 12,
  },
  pharmacyActions: {
  },
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryMuted,
  },
  pharmacyServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  serviceTag: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  serviceTagText: {
    fontSize: 10,
  },
  serviceTagDelivery: {
    backgroundColor: theme.colors.successMuted,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.backgroundModal, // Use theme color
    borderRadius: 20,
    padding: 20,
    paddingBottom: 20, // Add some padding at the bottom
    overflow: 'hidden', // Ensure content respects border radius
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8, // Increase touchable area
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicesTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  serviceItem: {
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 4,
    color: theme.colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute buttons
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 15,
  },
  modalButton: {
    flex: 1, // Allow buttons to share space
    marginHorizontal: 5, // Add some space between buttons
  },
  // Styles for the new "Choose Pharmacy for Prescription" Modal
  pharmacySearchInputModal: {
    marginVertical: 10,
    marginHorizontal: 5, // Align with modal padding
  },
  pharmacyListModal: {
    width: '100%',
    marginTop: 10,
  },
  pharmacyListItemModal: {
    backgroundColor: theme.colors.surface, // Use surface color for items
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pharmacyListItemModalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyListItemIconModal: {
    marginRight: 15,
  },
  pharmacyListItemTextContainerModal: {
    flex: 1,
  },
  pharmacyNameModal: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  pharmacyAddressModal: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.textSecondary,
  },
  // Ensure other styles are complete and correct
  // ... (rest of the styles)
});
