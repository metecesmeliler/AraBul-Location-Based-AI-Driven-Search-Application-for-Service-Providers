import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Message, ChatResponse } from '../types';
import { chatService } from '../apiService';

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initial system message
    const initialMessage: Message = {
      id: '1',
      text: 'Merhaba! Lütfen ne aradığını veya neye ihtiyacın olduğunu yaz.',
      sender: 'system',
      timestamp: Date.now()
    };
    setMessages([initialMessage]);
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await chatService.sendMessage(inputText);

      // Navigate to JSON display screen with the received data
      navigation.navigate('BusinessList', { 
        jsonData: JSON.stringify(response) 
      });
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        text: 'Üzgünüm, bir şeyler ters gitti.',
        sender: 'system',
        timestamp: Date.now()
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      style={[
        styles.messageBubble, 
        item.sender === 'system' 
          ? styles.systemMessage 
          : item.sender === 'user' 
            ? styles.userMessage 
            : styles.aiMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0084ff" />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Bir mesaj gir"
            placeholderTextColor="#888"
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              isLoading && styles.sendButtonDisabled
            ]} 
            onPress={sendMessage}
            disabled={isLoading}
          >
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageText: {
    color: '#333',  // Dark gray color for better readability
    fontSize: 16,   // Comfortable reading size
    lineHeight: 22, // Slightly increased line height for better spacing
  },
  messageList: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  systemMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#e6f2ff',
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#ffad00',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
