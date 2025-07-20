import * as React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface BentoCardData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  size: 'small' | 'medium' | 'large';
  route: string;
  badge?: string | number;
  color?: string;
}

interface BentoCardProps {
  data: BentoCardData;
  onPress: (route: string) => void;
  index: number;
}

interface BentoGridProps {
  cards: BentoCardData[];
  onCardPress: (route: string) => void;
}

const BentoCard = ({ data, onPress }: BentoCardProps) => {
  const getCardStyle = () => {
    const cardWidth = (width - 60) / 2;
    const baseStyle = {
      borderRadius: 16,
      backgroundColor: data.color || '#6366F1',
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };

    switch (data.size) {
      case 'small':
        return {
          ...baseStyle,
          width: cardWidth,
          height: cardWidth * 0.8,
        };
      case 'medium':
        return {
          ...baseStyle,
          width: cardWidth,
          height: cardWidth * 1.1,
        };
      case 'large':
        return {
          ...baseStyle,
          width: width - 40,
          height: cardWidth * 0.7,
        };
      default:
        return baseStyle;
    }
  };

  return React.createElement(
    TouchableOpacity,
    {
      style: getCardStyle(),
      onPress: () => onPress(data.route),
      activeOpacity: 0.8,
    },
    React.createElement(
      View,
      { style: styles.cardContent },
      React.createElement(
        View,
        { style: styles.cardHeader },
        data.badge && React.createElement(
          View,
          { style: styles.badge },
          React.createElement(
            Text,
            { style: styles.badgeText },
            data.badge
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.cardBody },
        React.createElement(
          Text,
          { style: styles.cardTitle },
          data.title
        ),
        data.subtitle && React.createElement(
          Text,
          { style: styles.cardSubtitle },
          data.subtitle
        )
      )
    )
  );
};

export const BentoGrid = ({ cards, onCardPress }: BentoGridProps) => {
  const largeCards = cards.filter(card => card.size === 'large');
  const smallMediumCards = cards.filter(card => card.size !== 'large');

  return React.createElement(
    View,
    { style: styles.container },
    ...largeCards.map((card, index) =>
      React.createElement(BentoCard, {
        key: card.id,
        data: card,
        onPress: onCardPress,
        index: index,
      })
    ),
    React.createElement(
      View,
      { style: styles.gridContainer },
      ...smallMediumCards.map((card, index) =>
        React.createElement(BentoCard, {
          key: card.id,
          data: card,
          onPress: onCardPress,
          index: largeCards.length + index,
        })
      )
    )
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
  },
});

export default BentoGrid;
