import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// South African pharmacy data
interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
}

interface Medication {
  id: string;
  name: string;
  genericName: string;
  price: number;
  originalPrice?: number;
  dosage: string;
  quantity: string;
  prescription: boolean;
  image: string;
  pharmacy: string;
  inStock: boolean;
}

const southAfricanPharmacies: Pharmacy[] = [
  {
    id: 'clicks',
    name: 'Clicks',
    logo: '🏥',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: 'R35',
  },
  {
    id: 'dischem',
    name: 'Dis-Chem',
    logo: '💊',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 'R25',
  },
  {
    id: 'medirite',
    name: 'Medirite',
    logo: '🩺',
    rating: 4.3,
    deliveryTime: '35-50 min',
    deliveryFee: 'R30',
  },
  {
    id: 'mopani',
    name: 'Mopani Pharmacy',
    logo: '🌿',
    rating: 4.4,
    deliveryTime: '40-60 min',
    deliveryFee: 'R40',
  },
];

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Panado',
    genericName: 'Paracetamol',
    price: 25.99,
    originalPrice: 32.99,
    dosage: '500mg',
    quantity: '20 tablets',
    prescription: false,
    image: '💊',
    pharmacy: 'Clicks',
    inStock: true,
  },
  {
    id: '2',
    name: 'Betadine',
    genericName: 'Povidone Iodine',
    price: 89.99,
    dosage: '10%',
    quantity: '125ml',
    prescription: false,
    image: '🧴',
    pharmacy: 'Dis-Chem',
    inStock: true,
  },
  {
    id: '3',
    name: 'Allergex',
    genericName: 'Chlorpheniramine',
    price: 15.50,
    dosage: '4mg',
    quantity: '10 tablets',
    prescription: false,
    image: '💊',
    pharmacy: 'Medirite',
    inStock: false,
  },
];

export default function CareHubScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<string | null>(null);

  const filteredMedications = mockMedications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = {
    primary: '#6366F1',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  };

  return React.createElement(
    View,
    { style: [styles.container, { backgroundColor: colors.background }] },
    React.createElement(
      View,
      { style: [styles.header, { paddingTop: insets.top }] },
      React.createElement(
        TouchableOpacity,
        {
          style: styles.backButton,
          onPress: () => router.back(),
        },
        React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: colors.textPrimary })
      ),
      React.createElement(
        Text,
        { style: [styles.headerTitle, { color: colors.textPrimary }] },
        'CareHub Marketplace'
      )
    ),
    React.createElement(
      ScrollView,
      { style: styles.content },
      React.createElement(
        View,
        { style: styles.searchContainer },
        React.createElement(
          View,
          { style: [styles.searchBox, { backgroundColor: colors.surface }] },
          React.createElement(Ionicons, { name: 'search', size: 20, color: colors.textSecondary }),
          React.createElement(TextInput, {
            style: [styles.searchInput, { color: colors.textPrimary }],
            placeholder: 'Search medications...',
            placeholderTextColor: colors.textSecondary,
            value: searchQuery,
            onChangeText: setSearchQuery,
          })
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: [styles.sectionTitle, { color: colors.textPrimary }] },
          'Partner Pharmacies'
        ),
        React.createElement(
          ScrollView,
          { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.pharmacyScroll },
          ...southAfricanPharmacies.map(pharmacy =>
            React.createElement(
              TouchableOpacity,
              {
                key: pharmacy.id,
                style: [
                  styles.pharmacyCard,
                  {
                    backgroundColor: selectedPharmacy === pharmacy.id ? colors.primary : colors.surface,
                  },
                ],
                onPress: () => setSelectedPharmacy(selectedPharmacy === pharmacy.id ? null : pharmacy.id),
              },
              React.createElement(
                Text,
                { style: styles.pharmacyLogo },
                pharmacy.logo
              ),
              React.createElement(
                Text,
                {
                  style: [
                    styles.pharmacyName,
                    {
                      color: selectedPharmacy === pharmacy.id ? colors.surface : colors.textPrimary,
                    },
                  ],
                },
                pharmacy.name
              ),
              React.createElement(
                View,
                { style: styles.pharmacyInfo },
                React.createElement(
                  Text,
                  {
                    style: [
                      styles.pharmacyRating,
                      {
                        color: selectedPharmacy === pharmacy.id ? colors.surface : colors.textSecondary,
                      },
                    ],
                  },
                  `⭐ ${pharmacy.rating}`
                ),
                React.createElement(
                  Text,
                  {
                    style: [
                      styles.pharmacyDelivery,
                      {
                        color: selectedPharmacy === pharmacy.id ? colors.surface : colors.textSecondary,
                      },
                    ],
                  },
                  pharmacy.deliveryTime
                )
              )
            )
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          { style: [styles.sectionTitle, { color: colors.textPrimary }] },
          'Available Medications'
        ),
        React.createElement(
          View,
          { style: styles.medicationGrid },
          ...filteredMedications.map(medication =>
            React.createElement(
              View,
              {
                key: medication.id,
                style: [styles.medicationCard, { backgroundColor: colors.surface }],
              },
              React.createElement(
                View,
                { style: styles.medicationHeader },
                React.createElement(
                  Text,
                  { style: styles.medicationImage },
                  medication.image
                ),
                React.createElement(
                  View,
                  {
                    style: [
                      styles.stockBadge,
                      {
                        backgroundColor: medication.inStock ? colors.success : colors.error,
                      },
                    ],
                  },
                  React.createElement(
                    Text,
                    { style: [styles.stockText, { color: colors.surface }] },
                    medication.inStock ? 'In Stock' : 'Out of Stock'
                  )
                )
              ),
              React.createElement(
                Text,
                { style: [styles.medicationName, { color: colors.textPrimary }] },
                medication.name
              ),
              React.createElement(
                Text,
                { style: [styles.medicationGeneric, { color: colors.textSecondary }] },
                medication.genericName
              ),
              React.createElement(
                Text,
                { style: [styles.medicationDosage, { color: colors.textSecondary }] },
                `${medication.dosage} • ${medication.quantity}`
              ),
              React.createElement(
                View,
                { style: styles.priceContainer },
                React.createElement(
                  Text,
                  { style: [styles.price, { color: colors.primary }] },
                  `R${medication.price.toFixed(2)}`
                ),
                medication.originalPrice && React.createElement(
                  Text,
                  { style: [styles.originalPrice, { color: colors.textSecondary }] },
                  `R${medication.originalPrice.toFixed(2)}`
                )
              ),
              React.createElement(
                TouchableOpacity,
                {
                  style: [
                    styles.addButton,
                    {
                      backgroundColor: medication.inStock ? colors.primary : colors.textSecondary,
                    },
                  ],
                  disabled: !medication.inStock,
                },
                React.createElement(
                  Text,
                  { style: [styles.addButtonText, { color: colors.surface }] },
                  medication.inStock ? 'Add to Cart' : 'Notify Me'
                )
              )
            )
          )
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pharmacyScroll: {
    paddingLeft: 20,
  },
  pharmacyCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  pharmacyLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  pharmacyInfo: {
    alignItems: 'center',
  },
  pharmacyRating: {
    fontSize: 12,
    marginBottom: 2,
  },
  pharmacyDelivery: {
    fontSize: 10,
    textAlign: 'center',
  },
  medicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  medicationCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationImage: {
    fontSize: 32,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationGeneric: {
    fontSize: 14,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 12,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  addButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
