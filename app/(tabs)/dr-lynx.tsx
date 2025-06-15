import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import ThemedGlassCard from '../../components/ThemedGlassCard';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'health-tip' | 'diet-recommendation' | 'emergency' | 'appointment-suggestion';
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  followUpSuggestions?: string[];
}

interface QuickAction {
  title: string;
  description: string;
  query: string;
  icon: string;
}

const quickActionsData: QuickAction[] = [
  {
    title: "Symptom Check",
    description: "Describe your symptoms for health guidance",
    query: "I'm experiencing symptoms and need guidance",
    icon: "medical"
  },
  {
    title: "Medication Info",
    description: "Ask about medications and interactions",
    query: "I need information about medications",
    icon: "flask"
  },
  {
    title: "Diet Advice",
    description: "Get personalized nutrition recommendations",
    query: "I need dietary advice and recommendations",
    icon: "nutrition"
  },
  {
    title: "Emergency Guide",
    description: "First aid and emergency procedures",
    query: "I need emergency medical guidance",
    icon: "warning"
  },
  {
    title: "Exercise Tips",
    description: "Safe exercises and fitness advice",
    query: "I want exercise and fitness recommendations",
    icon: "fitness"
  },
  {
    title: "Mental Health",
    description: "Mental wellness and stress management",
    query: "I need mental health support and advice",
    icon: "heart"
  }
];

export default function DrLynxScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scrollViewRef = useRef<FlatList<Message>>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const addWelcomeMessage = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        text: `Hello! I'm Dr. LYNX, your AI health companion. I'm here to help with health questions, symptoms, diet advice, and wellness tips specifically for South African healthcare. How can I assist you today?`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  useEffect(() => {
    const initializeChat = async () => {
      await loadChatHistory();
      addWelcomeMessage();
    };
    
    initializeChat();
  }, [addWelcomeMessage]);

  const loadChatHistory = async () => {
    try {
      const chatHistory = await AsyncStorage.getItem('drLynxChatHistory');
      if (chatHistory) {
        const parsedHistory = JSON.parse(chatHistory);
        setMessages(parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
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

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI response - in real app, this would call your AI service
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let responseText = "";
    let messageType: Message['type'] = 'text';
    let urgency: Message['urgency'] = 'low';

    // Simple keyword-based responses for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      responseText = "⚠️ If this is a medical emergency, please call 10177 (Netcare 911) or 112 immediately. For urgent care, visit your nearest hospital emergency room. I can provide general health information, but I cannot replace emergency medical services.";
      messageType = 'emergency';
      urgency = 'emergency';
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('fever')) {
      responseText = "I understand you're experiencing symptoms. While I can provide general health information, it's important to consult with a healthcare professional for proper diagnosis and treatment. Can you describe your symptoms in more detail? Also, consider visiting a nearby clinic or contacting your GP.";
      messageType = 'health-tip';
      urgency = 'medium';
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      responseText = "For medication information, I recommend consulting with a pharmacist or your doctor. They can provide specific guidance about dosages, interactions, and side effects. You can also find certified pharmacies through the South African Pharmacy Council. What specific medication questions do you have?";
      messageType = 'text';
    } else if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('food')) {
      responseText = "Good nutrition is essential for health! For South Africans, I recommend including local foods like morogo (leafy greens), sweet potatoes, beans, and lean proteins. The SA Department of Health recommends 5 servings of fruits and vegetables daily. Would you like specific dietary advice for any health conditions?";
      messageType = 'diet-recommendation';
    } else {
      responseText = "Thank you for your question. I'm here to help with health-related topics including symptoms, medications, diet, exercise, and wellness tips tailored for South African healthcare. Could you provide more details about what specific health information you're looking for?";
    }

    return {
      id: 'ai-' + Date.now(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      type: messageType,
      urgency,
      followUpSuggestions: ['Tell me more', 'Find nearby facilities', 'Get emergency contacts']
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setShowQuickActions(false);
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const aiResponse = await generateAIResponse(userMessage.text);
      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        text: "I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputText(action.query);
    setShowQuickActions(false);
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            await AsyncStorage.removeItem('drLynxChatHistory');
            setShowQuickActions(true);
            addWelcomeMessage();
          }
        }
      ]
    );
  };

  const getMessageTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'health-tip':
        return <Ionicons name="bulb" size={16} color={theme.colors.warning} />;
      case 'diet-recommendation':
        return <Ionicons name="nutrition" size={16} color={theme.colors.success} />;
      case 'emergency':
        return <Ionicons name="warning" size={16} color={theme.colors.error} />;
      case 'appointment-suggestion':
        return <Ionicons name="calendar" size={16} color={theme.colors.info} />;
      default:
        return <Ionicons name="medical" size={16} color={theme.colors.primary} />;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      {!item.isUser && (
        <View style={styles.aiHeader}>
          <View style={styles.aiAvatar}>
            <Ionicons name="medical" size={20} color={theme.colors.white} />
          </View>
          <View style={styles.aiInfo}>
            <Text style={styles.aiName}>Dr. LYNX</Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {item.type && item.type !== 'text' && (
            <View style={styles.messageTypeIcon}>
              {getMessageTypeIcon(item.type)}
            </View>
          )}
        </View>
      )}
      
      <ThemedGlassCard style={StyleSheet.flatten([
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
        item.urgency === 'emergency' ? styles.emergencyBubble : null
      ])}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.aiMessageText,
          item.urgency === 'emergency' && styles.emergencyText
        ]}>
          {item.text}
        </Text>
      </ThemedGlassCard>

      {item.isUser && (
        <View style={styles.userInfo}>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={theme.colors.white} />
          </View>
        </View>
      )}

      {item.followUpSuggestions && item.followUpSuggestions.length > 0 && (
        <View style={styles.followUpContainer}>
          {item.followUpSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.followUpButton}
              onPress={() => setInputText(suggestion)}
            >
              <Text style={styles.followUpText}>{suggestion}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>How can I help you today?</Text>
      <View style={styles.quickActionsGrid}>
        {quickActionsData.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon as any} size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={theme.gradients.primary as [string, string]} 
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Ionicons name="medical" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Dr. LYNX</Text>
              <Text style={styles.headerSubtitle}>AI Health Assistant</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Ionicons name="trash-outline" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
            ref={scrollViewRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={showQuickActions ? renderQuickActions() : null}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>Dr. LYNX is typing...</Text>
                </View>
              ) : null
            }
          />
        </KeyboardAvoidingView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Dr. LYNX about your health..."
              placeholderTextColor={theme.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={!inputText.trim() ? theme.colors.textSecondary : theme.colors.white} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aiInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.white,
    opacity: 0.7,
  },
  messageTypeIcon: {
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.primary + '20',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomLeftRadius: 4,
  },
  emergencyBubble: {
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: theme.colors.white,
  },
  aiMessageText: {
    color: theme.colors.white,
  },
  emergencyText: {
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  followUpContainer: {
    marginTop: 12,
    marginLeft: 42,
  },
  followUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 6,
  },
  followUpText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.white,
  },
  typingIndicator: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
});
