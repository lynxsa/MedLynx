import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPalette } from '../../constants/DynamicTheme';
import { useTheme } from '../../contexts/ThemeContext';
import GeminiHealthService from '../../services/GeminiHealthService';

const { width } = Dimensions.get('window');

// Initialize Gemini Health Service with your API key
const GEMINI_API_KEY = 'AIzaSyDpbXKi1BQDHkqUwSEeTf-8uDK6VjlSQT8';
const geminiService = new GeminiHealthService(GEMINI_API_KEY);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  type?: string;
}

interface QuickQuestion {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  query: string;
  color: string;
}

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: '1',
    icon: 'medical',
    title: 'Symptom Analysis',
    subtitle: 'AI-powered health assessment',
    query: 'I\'m experiencing some symptoms and would like a comprehensive health assessment',
    color: '#7C3AED',
  },
  {
    id: '2',
    icon: 'heart',
    title: 'Heart Health',
    subtitle: 'Cardiovascular wellness check',
    query: 'Help me understand my heart health and provide cardiovascular wellness recommendations',
    color: '#8B5CF6',
  },
  {
    id: '3',
    icon: 'nutrition',
    title: 'Nutrition Guide',
    subtitle: 'Personalized diet planning',
    query: 'I need personalized nutrition advice and meal planning based on my health profile',
    color: '#A855F7',
  },
  {
    id: '4',
    icon: 'fitness',
    title: 'Fitness Plan',
    subtitle: 'Custom exercise routine',
    query: 'Create a comprehensive fitness plan tailored to my health condition and goals',
    color: '#9333EA',
  },
  {
    id: '5',
    icon: 'medkit',
    title: 'Medications',
    subtitle: 'Drug interactions & guidance',
    query: 'Help me understand my medications, check for interactions, and provide dosage guidance',
    color: '#7C3AED',
  },
  {
    id: '6',
    icon: 'moon',
    title: 'Sleep Health',
    subtitle: 'Optimize sleep quality',
    query: 'How can I improve my sleep quality and establish better sleep habits for optimal health?',
    color: '#8B5CF6',
  },
];

export default function DrLynxScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors as ColorPalette;
  const flatListRef = useRef<FlatList<Message>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadChatHistory();
    // Animate welcome screen entrance with smoother timing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadChatHistory = async () => {
    try {
      const chatHistory = await AsyncStorage.getItem('drLynxChatHistory');
      if (chatHistory) {
        const parsedHistory = JSON.parse(chatHistory);
        const parsedMessages = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
        if (parsedMessages.length > 0) {
          setShowWelcome(false);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('drLynxChatHistory', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to start a new conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setShowWelcome(true);
            AsyncStorage.removeItem('drLynxChatHistory');
            
            // Re-animate welcome screen
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      ]
    );
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    setInputText(question.query);
    setShowWelcome(false);
    // Auto-send with smoother transition
    setTimeout(() => {
      sendMessage(question.query);
    }, 150);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setShowWelcome(false);
    setIsTyping(true);

    try {
      // Use real Gemini API for AI responses
      const geminiResponse = await geminiService.sendMessage(textToSend);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse.text,
        isUser: false,
        timestamp: new Date(),
        urgency: geminiResponse.urgency,
        type: geminiResponse.type,
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      setIsTyping(false);
      saveChatHistory(finalMessages);

      // Show emergency alert if needed
      if (geminiResponse.urgency === 'emergency') {
        Alert.alert(
          '🚨 Medical Emergency Detected',
          'Please call emergency services immediately at 10177 if this is life-threatening.',
          [
            { text: 'I understand', style: 'default' },
            { text: 'Call 10177', onPress: () => {
              // In a real app, you could use Linking.openURL('tel:10177')
              Alert.alert('Emergency', 'This would dial 10177 in a real app');
            }},
          ]
        );
      }

      // Smooth scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback response for API errors
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting to my knowledge base right now. For urgent health concerns, please contact your healthcare provider or call emergency services at 10177.",
        isUser: false,
        timestamp: new Date(),
        urgency: 'medium',
        type: 'error',
      };

      const finalMessages = [...updatedMessages, fallbackMessage];
      setMessages(finalMessages);
      setIsTyping(false);
      saveChatHistory(finalMessages);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.aiAvatarContainer}>
          <Image 
            source={require('../../assets/images/logo.png')}
            style={styles.aiAvatarImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, styles.dot1]} />
            <Animated.View style={[styles.typingDot, styles.dot2]} />
            <Animated.View style={[styles.typingDot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const urgencyColor = item.urgency === 'emergency' ? '#EF4444' : 
                        item.urgency === 'high' ? '#F59E0B' :
                        item.urgency === 'medium' ? '#3B82F6' : '#10B981';

    const highPriorityUrgencies = ['medium', 'high', 'emergency'];
    const showUrgencyBadge = !item.isUser && item.urgency && highPriorityUrgencies.includes(item.urgency);

    return (
      <View style={[
        styles.messageWrapper,
        item.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
      ]}>
        {!item.isUser && (
          <View style={styles.aiAvatarContainer}>
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.aiAvatarImage}
              resizeMode="contain"
            />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userMessage : styles.aiMessage,
          showUrgencyBadge && {
            borderColor: urgencyColor,
            borderWidth: 2,
          }
        ]}>
          {showUrgencyBadge && (
            <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
              <Text style={styles.urgencyText}>
                {item.urgency === 'emergency' ? '🚨 EMERGENCY' : 
                 item.urgency === 'high' ? '⚠️ HIGH PRIORITY' : 
                 item.urgency === 'medium' ? 'ℹ️ MEDIUM PRIORITY' : ''}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText,
            item.urgency === 'emergency' && { fontSize: 15, fontWeight: '600' }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            item.isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderWelcomeScreen = () => {
    if (!showWelcome) return null;

    return (
      <Animated.View 
        style={[
          styles.welcomeContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Hero Section */}
        <View style={styles.welcomeHeader}>
          <LinearGradient
            colors={['#7C3AED', '#8B5CF6', '#A855F7']}
            style={styles.welcomeAvatar}
          >
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.welcomeAvatarImage}
              resizeMode="contain"
            />
          </LinearGradient>
          
          <Text style={styles.welcomeTitle}>Hello! I&apos;m Dr. LYNX</Text>
          <Text style={styles.welcomeSubtitle}>
            Your intelligent health companion powered by advanced AI. I&apos;m here to provide personalized medical insights, wellness guidance, and health monitoring.
          </Text>
          
          {/* Capabilities Preview */}
          <View style={styles.capabilitiesContainer}>
            <View style={styles.capabilityItem}>
              <View style={[styles.capabilityIcon, { backgroundColor: '#7C3AED' }]}>
                <Ionicons name="medical" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.capabilityText}>Symptom Analysis</Text>
            </View>
            <View style={styles.capabilityItem}>
              <View style={[styles.capabilityIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="fitness" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.capabilityText}>Wellness Guidance</Text>
            </View>
            <View style={styles.capabilityItem}>
              <View style={[styles.capabilityIcon, { backgroundColor: '#A855F7' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.capabilityText}>Health Monitoring</Text>
            </View>
          </View>
        </View>

        {/* Quick Questions Grid */}
        <View style={styles.quickQuestionsSection}>
          <Text style={styles.quickQuestionsTitle}>Quick Health Topics</Text>
          <View style={styles.quickQuestionsGrid}>
            {QUICK_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={question.id}
                style={[styles.quickQuestionCard]}
                onPress={() => handleQuickQuestion(question)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[question.color, question.color + 'CC']}
                  style={styles.quickQuestionGradient}
                >
                  <View style={styles.quickQuestionIcon}>
                    <Ionicons name={question.icon} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.quickQuestionContent}>
                    <Text style={styles.quickQuestionTitle}>{question.title}</Text>
                    <Text style={styles.quickQuestionSubtitle}>{question.subtitle}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatarContainer}>
              <Image 
                source={require('../../assets/images/logo.png')}
                style={styles.headerAvatarImage}
                resizeMode="contain"
              />
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Dr. LYNX</Text>
              <Text style={styles.headerSubtitle}>Always ready to help</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton} onPress={clearChat}>
            <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <View style={styles.chatContainer}>
          {showWelcome ? (
            renderWelcomeScreen()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={renderTypingIndicator}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </View>

        {/* Enhanced Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your health..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isTyping}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#7C3AED', '#8B5CF6'] : [colors.textSecondary, colors.textSecondary]}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name={isTyping ? "hourglass" : "send"} 
                  size={18} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  
  // Modern Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface + '95',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary + '40',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  headerAvatarContainer: {
    position: 'relative',
    backgroundColor: '#7C3AED',
    borderRadius: 22,
    padding: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerAvatarImage: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Chat Container
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatarContainer: {
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiAvatarImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 6,
  },
  aiMessage: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary + '60',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  typingBubble: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.backgroundSecondary + '60',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary + '80',
    marginHorizontal: 2,
  },
  dot1: {},
  dot2: {},
  dot3: {},
  
  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  welcomeAvatarImage: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '400',
  },
  capabilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  capabilityItem: {
    alignItems: 'center',
    flex: 1,
  },
  capabilityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilityText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Quick Questions
  quickQuestionsSection: {
    flex: 1,
  },
  quickQuestionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  quickQuestionsGrid: {
    flex: 1,
    paddingHorizontal: 4,
  },
  quickQuestionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: width - 48, // Use the width variable
  },
  quickQuestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  quickQuestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickQuestionContent: {
    flex: 1,
  },
  quickQuestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  quickQuestionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    lineHeight: 18,
  },
  
  // Input Area
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.surface + '95',
    backdropFilter: 'blur(10px)',
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary + '40',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.backgroundSecondary + '60',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
    fontWeight: '400',
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Urgency indicator styles
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
