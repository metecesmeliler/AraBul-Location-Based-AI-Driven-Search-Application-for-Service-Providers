import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList, Message } from "../types";
import { chatService } from "../apiService";

type Props = StackScreenProps<RootStackParamList, "Chat">;

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [awaitingCity, setAwaitingCity] = useState<boolean>(false);
  const [initialQuery, setInitialQuery] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // This effect only runs once when component mounts
    const initialMessage: Message = {
      id: "1",
      text: "Merhaba! Lütfen ne aradığını veya neye ihtiyacın olduğunu yaz.",
      sender: "system",
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, []);

  const scrollToBottom = useCallback((animated = false) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
    }
  }, [messages.length]);

  useEffect(() => {
    // This effect handles keyboard show events
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (isAtBottom) {
          scrollToBottom(true);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [isAtBottom, scrollToBottom]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    setIsAtBottom(isCloseToBottom);
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: inputText.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    if (!awaitingCity) {
      // Store the initial query and ask for city
      setInitialQuery(inputText.trim());
      const cityPrompt: Message = {
        id: `${Date.now()}-system`,
        text: "Lütfen bulunduğunuz şehri girin.",
        sender: "system",
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, cityPrompt]);
      setAwaitingCity(true);
    } else {
      // We have both the query and city, proceed with API call
      setIsLoading(true);
      try {
        const messageWithCity = {
          query: initialQuery,
          city: inputText.trim()
        };
        const response = await chatService.sendMessage(JSON.stringify(messageWithCity));
        
        // Navigate to BusinessList
        navigation.navigate("BusinessList", {
          jsonData: JSON.stringify(response),
        });
        
        // Add a new system message indicating we're ready for the next query
        const newQueryPrompt: Message = {
          id: `${Date.now()}-system`,
          text: "Başka bir arama yapmak ister misiniz?",
          sender: "system",
          timestamp: Date.now(),
        };
        setMessages(prevMessages => [...prevMessages, newQueryPrompt]);
        
        // Reset only the query-related states
        setAwaitingCity(false);
        setInitialQuery("");
      } catch (error) {
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          text: "Üzgünüm, bir şeyler ters gitti.",
          sender: "system",
          timestamp: Date.now(),
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        // Reset states on error
        setAwaitingCity(false);
        setInitialQuery("");
      } finally {
        setIsLoading(false);
      }
    }
    setInputText("");
  };

  const renderMessage = useCallback(({ item }: ListRenderItemInfo<Message>) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "system"
          ? styles.systemMessage
          : item.sender === "user"
          ? styles.userMessage
          : styles.aiMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const getItemLayout = useCallback((data: Message[] | null | undefined, index: number) => ({
    length: 80, // Approximate height of each message
    offset: 80 * index,
    index,
  }), []);

  const handleContentSizeChange = useCallback(() => {
    if (isAtBottom) {
      scrollToBottom(true);
    }
  }, [isAtBottom, scrollToBottom]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.select({ android: undefined, ios: 'padding' })}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleContentSizeChange}
          removeClippedSubviews={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          windowSize={21}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0084ff" />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={awaitingCity ? "Şehrinizi girin" : "Bir mesaj gir"}
            placeholderTextColor="#888"
            editable={!isLoading}
            multiline
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            enablesReturnKeyAutomatically
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  messageList: {
    padding: 10,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignSelf: "flex-start",
    elevation: 1,
  },
  systemMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#e6f2ff",
    alignSelf: "flex-start",
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    elevation: 3,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "white",
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: "#ffad00",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-end',
    marginBottom: 1,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
