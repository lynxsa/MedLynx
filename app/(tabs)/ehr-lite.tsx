import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';

interface HealthDocument {
  id: string;
  title: string;
  type: 'medical-report' | 'lab-result' | 'prescription' | 'vaccination' | 'insurance' | 'other';
  uploadDate: string;
  fileName: string;
  fileSize: string;
  aiSummary?: string;
  tags: string[];
  isProcessing: boolean;
  uri: string;
  category: string;
}

interface HealthSummary {
  totalDocuments: number;
  recentUploads: number;
  aiInsights: string[];
  upcomingReminders: string[];
}

export default function EHRLiteScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const primaryDarkColor = useThemeColor({}, 'primaryDark');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textLightColor = useThemeColor({}, 'textLight');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const whiteColor = useThemeColor({}, 'buttonText'); // Assuming buttonText is white or a suitable contrast
  const errorColor = useThemeColor({}, 'error');
  const drLynxPrimaryColor = useThemeColor('drLynx', 'primary');
  const drLynxBackgroundColor = useThemeColor('drLynx', 'background');
  const drLynxTextColor = useThemeColor('drLynx', 'text');
  const medicalHealthColor = useThemeColor('medical', 'health');
  const medicalInfoColor = useThemeColor('medical', 'info');
  const medicalMedicineColor = useThemeColor('medical', 'medicine');
  const medicalSuccessColor = useThemeColor('medical', 'success');
  const medicalWarningColor = useThemeColor('medical', 'warning');
  const primaryVeryLight = useThemeColor({}, 'primaryVeryLight');


  const documentTypes = [
    { key: 'medical-report', label: 'Medical Report', icon: 'document-text', color: medicalHealthColor },
    { key: 'lab-result', label: 'Lab Results', icon: 'flask', color: medicalInfoColor },
    { key: 'prescription', label: 'Prescription', icon: 'medical', color: medicalMedicineColor },
    { key: 'vaccination', label: 'Vaccination', icon: 'shield-checkmark', color: medicalSuccessColor },
    { key: 'insurance', label: 'Insurance', icon: 'shield', color: medicalWarningColor },
    { key: 'other', label: 'Other', icon: 'folder', color: textSecondaryColor },
  ];

  const [documents, setDocuments] = useState<HealthDocument[]>(sampleDocuments);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'documents' | 'insights'>('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<HealthDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const healthSummary: HealthSummary = {
    totalDocuments: documents.length,
    recentUploads: documents.filter(doc => {
      const uploadDate = new Date(doc.uploadDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length,
    aiInsights: [
      'Regular monitoring of blood pressure recommended',
      'Consider dietary consultation for cholesterol management',
      'Annual health screenings are up to date'
    ],
    upcomingReminders: [
      'Annual physical exam due in 3 months',
      'Dental checkup overdue by 2 weeks',
      'Eye exam scheduled for next month'
    ]
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleUploadDocument = () => {
    setUploadModalVisible(true);
  };

  const uploadFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processDocumentUpload(result.assets[0]);
      }
    } catch (err) {
      console.error('Error selecting document:', err);
      Alert.alert('Error', 'Failed to select document');
    }
    setUploadModalVisible(false);
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

    if (!result.canceled && result.assets && result.assets[0]) {
      await processDocumentUpload(result.assets[0]);
    }
    setUploadModalVisible(false);
  };

  const processDocumentUpload = async (file: DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset) => {
    setUploadProgress(true);
    
    const newDocument: HealthDocument = {
      id: Date.now().toString(),
      title: 'Processing Document...',
      type: 'other',
      uploadDate: new Date().toISOString().split('T')[0],
      fileName: file.name || (file as ImagePicker.ImagePickerAsset).fileName || 'document.file',
      fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
      tags: [],
      isProcessing: true,
      uri: file.uri,
      category: 'Unprocessed'
    };

    setDocuments(prev => [newDocument, ...prev]);

    // Simulate AI processing
    setTimeout(() => {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === newDocument.id
            ? {
                ...doc,
                title: 'Health Document',
                type: 'medical-report',
                aiSummary: 'Document uploaded successfully. AI analysis in progress...',
                isProcessing: false,
                category: 'Recent Upload'
              }
            : doc
        )
      );
      setUploadProgress(false);
      Alert.alert('Success', 'Document uploaded and processed successfully!');
    }, 3000);
  };

  const viewDocument = (document: HealthDocument) => {
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const deleteDocument = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    const docType = documentTypes.find(t => t.key === type);
    return docType ? docType.icon : 'document';
  };

  const getTypeColor = (type: string) => {
    const docType = documentTypes.find(t => t.key === type);
    return docType ? docType.color : textSecondaryColor;
  };

  const getTypeLabel = (type: string) => {
    const docType = documentTypes.find(t => t.key === type);
    return docType ? docType.label : 'Other';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      paddingBottom: 20,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: whiteColor,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginTop: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Consider theming this
    },
    tabText: {
      color: 'rgba(255, 255, 255, 0.7)', // Consider theming this
      fontWeight: '500',
    },
    activeTabText: {
      color: whiteColor,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
    },
    tabContent: {
      padding: 20,
    },
    overviewGrid: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    overviewCard: {
      flex: 1,
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    overviewIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    overviewContentStyle: { // Renamed from overviewContent to avoid conflict
      flex: 1,
    },
    overviewValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColor,
    },
    overviewTitleText: { // Renamed from overviewTitle to avoid conflict
      fontSize: 12,
      color: textSecondaryColor,
      marginTop: 2,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: 16,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 12,
    },
    viewAllText: {
      color: primaryColor,
      fontWeight: '600',
      marginRight: 4,
    },
    searchAndFilter: {
      marginBottom: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: textColor,
      fontSize: 16,
    },
    filterContainer: {
      flexDirection: 'row',
    },
    filterChip: {
      backgroundColor: cardBackgroundColor,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: borderColor,
    },
    activeFilterChip: {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    },
    filterChipText: {
      color: textSecondaryColor,
      fontSize: 12,
      fontWeight: '500',
    },
    activeFilterChipText: {
      color: whiteColor,
    },
    uploadProgressContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      marginBottom: 20,
    },
    uploadProgressText: {
      marginTop: 12,
      color: textSecondaryColor,
    },
    documentCard: {
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      // borderLeftColor: primaryColor, // Applied dynamically
    },
    documentHeader: {
      marginBottom: 12,
    },
    documentMainInfo: {
      flex: 1,
    },
    documentTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    typeIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    documentTitleText: { // Renamed from documentTitle
      fontSize: 16,
      fontWeight: 'bold',
      color: textColor,
      flex: 1,
    },
    documentTypeText: { // Renamed from documentType
      fontSize: 12,
      color: textSecondaryColor,
      marginLeft: 32,
    },
    documentDate: {
      fontSize: 12,
      color: textLightColor,
      marginLeft: 32,
      marginTop: 2,
    },
    aiSummarySection: {
      backgroundColor: drLynxBackgroundColor,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    aiSummaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    aiSummaryLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: drLynxTextColor,
      marginLeft: 4,
    },
    aiSummaryText: {
      fontSize: 14,
      color: drLynxTextColor,
      lineHeight: 20,
    },
    documentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    documentMeta: {
      flex: 1,
    },
    documentFileName: {
      fontSize: 12,
      color: textSecondaryColor,
    },
    documentSize: {
      fontSize: 10,
      color: textLightColor,
      marginTop: 2,
    },
    tagsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tag: {
      backgroundColor: primaryVeryLight,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 4,
    },
    tagText: {
      fontSize: 10,
      color: primaryColor,
      fontWeight: '500',
    },
    moreTagsText: {
      fontSize: 10,
      color: textLightColor,
      marginLeft: 4,
    },
    insightsSection: {
      marginBottom: 24,
    },
    insightCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    insightText: {
      flex: 1,
      marginLeft: 12,
      color: textColor,
      lineHeight: 20,
    },
    reminderCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: cardBackgroundColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    reminderText: {
      flex: 1,
      marginLeft: 12,
      color: textColor,
      lineHeight: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitleText: { // Renamed from emptyTitle
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: textSecondaryColor,
      textAlign: 'center',
      marginTop: 8,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    modalTitleText: { // Renamed from modalTitle
      fontSize: 20,
      fontWeight: 'bold',
      color: textColor,
    },
    uploadOptions: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    uploadOption: {
      alignItems: 'center',
      backgroundColor: cardBackgroundColor,
      borderRadius: 16,
      padding: 32,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: borderColor,
    },
    uploadOptionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      marginTop: 16,
    },
    uploadOptionSubtitle: {
      fontSize: 14,
      color: textSecondaryColor,
      textAlign: 'center',
      marginTop: 8,
    },
    documentDetailContent: {
      flex: 1,
      padding: 20,
    },
    documentDetailSection: {
      marginBottom: 20,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: textSecondaryColor,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: textColor,
    },
    detailSubvalue: {
      fontSize: 12,
      color: textLightColor,
      marginTop: 2,
    },
    aiSummaryDetailText: {
      fontSize: 16,
      color: drLynxTextColor, // Changed from textColor
      lineHeight: 24,
      backgroundColor: drLynxBackgroundColor,
      padding: 12,
      borderRadius: 8,
    },
    tagsDetailContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagDetail: {
      backgroundColor: primaryVeryLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagDetailText: {
      fontSize: 12,
      color: primaryColor,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
    },
    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: errorColor,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    deleteButtonText: {
      color: whiteColor,
      fontWeight: 'bold',
    },
    viewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: primaryColor,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    viewButtonText: { // Added
      color: whiteColor,
      fontWeight: 'bold',
    }
  });


  const renderOverviewCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.overviewCard}>
      <View style={[styles.overviewIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color={whiteColor} />
      </View>
      <View style={styles.overviewContentStyle}>
        <Text style={styles.overviewValue}>{value}</Text>
        <Text style={styles.overviewTitleText}>{title}</Text>
      </View>
    </View>
  );

  const renderDocumentCard = (document: HealthDocument) => (
    <TouchableOpacity
      key={document.id}
      style={[styles.documentCard, { borderLeftColor: getTypeColor(document.type) }]}
      onPress={() => viewDocument(document)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentMainInfo}>
          <View style={styles.documentTitleRow}>
            <View style={[styles.typeIcon, { backgroundColor: getTypeColor(document.type) }]}>
              <Ionicons name={getTypeIcon(document.type) as any} size={16} color={whiteColor} />
            </View>
            <Text style={styles.documentTitleText}>{document.title}</Text>
            {document.isProcessing && (
              <ActivityIndicator size="small" color={primaryColor} />
            )}
          </View>
          <Text style={styles.documentTypeText}>{getTypeLabel(document.type)}</Text>
          <Text style={styles.documentDate}>
            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {document.aiSummary && !document.isProcessing && (
        <View style={styles.aiSummarySection}>
          <View style={styles.aiSummaryHeader}>
            <Ionicons name="sparkles" size={14} color={drLynxPrimaryColor} />
            <Text style={styles.aiSummaryLabel}>AI Summary</Text>
          </View>
          <Text style={styles.aiSummaryText} numberOfLines={2}>
            {document.aiSummary}
          </Text>
        </View>
      )}

      <View style={styles.documentFooter}>
        <View style={styles.documentMeta}>
          <Text style={styles.documentFileName}>{document.fileName}</Text>
          <Text style={styles.documentSize}>{document.fileSize}</Text>
        </View>
        {document.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {document.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {document.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{document.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[primaryColor, primaryDarkColor]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={whiteColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EHR Lite</Text>
          <TouchableOpacity onPress={handleUploadDocument}>
            <Ionicons name="add-circle-outline" size={24} color={whiteColor} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['overview', 'documents', 'insights'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]}>
                {tab === 'overview' ? 'Overview' : tab === 'documents' ? 'Documents' : 'Insights'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {selectedTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.overviewGrid}>
              {renderOverviewCard('Total Documents', healthSummary.totalDocuments, 'folder', primaryColor)}
              {renderOverviewCard('Recent Uploads', healthSummary.recentUploads, 'cloud-upload', medicalInfoColor)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Documents</Text>
              {documents.slice(0, 3).map(renderDocumentCard)}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setSelectedTab('documents')}
              >
                <Text style={styles.viewAllText}>View All Documents</Text>
                <Ionicons name="chevron-forward" size={16} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedTab === 'documents' && (
          <View style={styles.tabContent}>
            <View style={styles.searchAndFilter}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={textLightColor} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search documents..."
                  placeholderTextColor={textLightColor}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === 'all' && styles.activeFilterChip]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.activeFilterChipText]}>
                    All
                  </Text>
                </TouchableOpacity>
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.filterChip, selectedFilter === type.key && styles.activeFilterChip]}
                    onPress={() => setSelectedFilter(type.key)}
                  >
                    <Text style={[styles.filterChipText, selectedFilter === type.key && styles.activeFilterChipText]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {uploadProgress && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={styles.uploadProgressText}>Processing document...</Text>
              </View>
            )}

            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(renderDocumentCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color={textLightColor} />
                <Text style={styles.emptyTitleText}>No Documents Found</Text>
                <Text style={styles.emptySubtitle}>
                  Upload your first health document to get started
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'insights' && (
          <View style={styles.tabContent}>
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>AI Health Insights</Text>
              {healthSummary.aiInsights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Ionicons name="bulb" size={20} color={medicalWarningColor} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
              {healthSummary.upcomingReminders.map((reminder, index) => (
                <View key={index} style={styles.reminderCard}>
                  <Ionicons name="calendar" size={20} color={medicalInfoColor} />
                  <Text style={styles.reminderText}>{reminder}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setUploadModalVisible(false)} 
      >
        <View style={[styles.modalContainer, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitleText}>Upload Document</Text>
            <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadOption} onPress={uploadFromFiles}>
              <Ionicons name="document" size={48} color={primaryColor} />
              <Text style={styles.uploadOptionTitle}>Choose File</Text>
              <Text style={styles.uploadOptionSubtitle}>Select PDF or image from device</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={uploadFromCamera}>
              <Ionicons name="camera" size={48} color={primaryColor} />
              <Text style={styles.uploadOptionTitle}>Take Photo</Text>
              <Text style={styles.uploadOptionSubtitle}>Capture document with camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedDocument && (
          <View style={[styles.modalContainer, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>{selectedDocument.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.documentDetailContent}>
              <View style={styles.documentDetailSection}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{getTypeLabel(selectedDocument.type)}</Text>
              </View>
              <View style={styles.documentDetailSection}>
                <Text style={styles.detailLabel}>Upload Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.documentDetailSection}>
                <Text style={styles.detailLabel}>File</Text>
                <Text style={styles.detailValue}>{selectedDocument.fileName}</Text>
                <Text style={styles.detailSubvalue}>{selectedDocument.fileSize}</Text>
              </View>
              
              {selectedDocument.aiSummary && (
                <View style={styles.documentDetailSection}>
                  <Text style={styles.detailLabel}>AI Summary</Text>
                  <Text style={styles.aiSummaryDetailText}>{selectedDocument.aiSummary}</Text>
                </View>
              )}

              {selectedDocument.tags.length > 0 && (
                <View style={styles.documentDetailSection}>
                  <Text style={styles.detailLabel}>Tags</Text>
                  <View style={styles.tagsDetailContainer}>
                    {selectedDocument.tags.map((tag, index) => (
                      <View key={index} style={styles.tagDetail}>
                        <Text style={styles.tagDetailText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteDocument(selectedDocument.id)}
              >
                <Ionicons name="trash" size={18} color={whiteColor} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => Alert.alert('View Document', 'Document viewer would open here')}
              >
                <Ionicons name="eye" size={18} color={whiteColor} />
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

// Sample documents (keep outside component or fetch from a service)
const sampleDocuments: HealthDocument[] = [
  {
    id: '1',
    title: 'Annual Physical Exam',
    type: 'medical-report',
    uploadDate: '2024-12-01',
    fileName: 'physical_exam_2024.pdf',
    fileSize: '2.3 MB',
    aiSummary: 'Overall health status is good. Blood pressure slightly elevated. Recommended to monitor diet and exercise regularly.',
    tags: ['annual checkup', 'blood pressure', 'general health'],
    isProcessing: false,
    uri: 'mock://document1.pdf',
    category: 'Routine Care'
  },
  {
    id: '2',
    title: 'Blood Test Results',
    type: 'lab-result',
    uploadDate: '2024-11-28',
    fileName: 'blood_test_nov2024.pdf',
    fileSize: '1.8 MB',
    aiSummary: 'Blood glucose levels are within normal range. Cholesterol slightly high - consider dietary changes.',
    tags: ['blood test', 'glucose', 'cholesterol'],
    isProcessing: false,
    uri: 'mock://document2.pdf',
    category: 'Laboratory'
  },
  {
    id: '3',
    title: 'COVID-19 Vaccination',
    type: 'vaccination',
    uploadDate: '2024-11-15',
    fileName: 'covid_vaccine_cert.jpg',
    fileSize: '0.5 MB',
    aiSummary: 'COVID-19 booster vaccination completed. Next booster recommended in 12 months.',
    tags: ['vaccination', 'covid-19', 'booster'],
    isProcessing: false,
    uri: 'mock://document3.jpg',
    category: 'Immunization'
  }
];
