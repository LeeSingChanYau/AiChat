import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import OpenAI from 'openai';
import axios from 'axios';
import { useEffect } from 'react';
import { API_KEY } from '@env';

export default function App() {
  const [text, setText] = useState<string>('');
  const [userMessageSent, setUserMessageSent] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const openai = new OpenAI({
    apiKey: API_KEY, // This is the default and can be omitted
  });

  const fetchAIResponse = async (prompt: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/response?m=${prompt}`
      );
      console.log('data:', response.data);
      console.log(messages);
      setMessages([...messages, { role: 'assistant', content: response.data }]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  useEffect(() => {
    if (userMessageSent) {
      const prompt = messages[messages.length - 1].content;
      fetchAIResponse(prompt);
      setUserMessageSent(false);
    }
  }, [userMessageSent]);

  return (
    <View style={styles.container}>
      <View style={styles.messages}>
        {messages.map((message, index) => {
          return (
            <View style={styles.messageContainer} key={index}>
              <Text style={styles.name}>
                {message.role === 'user' ? 'You' : 'GPT'}
              </Text>
              <View
                style={
                  message.role === 'user'
                    ? styles.messageWrapper
                    : styles.AiMessageWrapper
                }
              >
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.chatForm}>
        <TextInput
          style={styles.textInput}
          placeholder="Is water wet?"
          onChangeText={(newText) => setText(newText)}
          defaultValue={text}
        />
        <TouchableOpacity>
          <FontAwesome
            name="arrow-up"
            size={32}
            onPress={() => {
              setMessages([...messages, { role: 'user', content: text }]);
              setUserMessageSent(true);
            }}
          />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  textInput: {
    flex: 4,
    borderWidth: 0.8,
    borderRadius: 3,
    height: 40,
    padding: 10,
  },
  messages: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 20,
    position: 'absolute',
    top: 100,
  },
  messageWrapper: {
    backgroundColor: 'blue',
    minHeight: 50,
    borderRadius: 5,
    marginBottom: 20,
    padding: 8,
  },
  AiMessageWrapper: {
    backgroundColor: 'green',
    minHeight: 50,
    borderRadius: 5,
    marginBottom: 20,
    padding: 8,
  },
  messageText: {
    width: 300,
    color: 'white',
  },
  name: {
    width: 300,
    color: 'black',
    fontWeight: 'bold',
  },
  chatForm: {
    flexDirection: 'row',
    gap: 20,
    position: 'absolute',
    bottom: 80,
    width: '90%',
  },
  messageContainer: {
    gap: 10,
  },
});
