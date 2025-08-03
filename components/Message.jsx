import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Message({ navigation, route }) {
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);
  const { currentUser } = route.params; 
  const [selectedMessage, setSelectedMessage] = useState(null);

  const user = route?.params?.user;

const postMessage = async (message) => {
  try {
    const chatId = [currentUser.id, user.id].sort().join('_'); // shared chat path
    console.log("Sending message to:", chatId);
    console.log("Message payload:", message);

    const response = await fetch(
      `https://default-de818-default-rtdb.firebaseio.com/Chats/${chatId}.json`,
      {
        method: "POST",
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    console.log("Message sent:", message);
    fetchMessages(); // Refresh chat after sending
  } catch (error) {
    console.error("Error sending message:", error);
  }
};


const fetchMessages = async () => {
  try {
    const chatId = [currentUser.id, user.id].sort().join('_');
    console.log("Fetching messages from:", chatId);

    const response = await fetch(
      `https://default-de818-default-rtdb.firebaseio.com/Chats/${chatId}.json`
    );
    const data = await response.json();

    const messagesArray = data
      ? Object.values(data).sort((a, b) => a.id - b.id)
      : [];

    setChats(messagesArray);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};


  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chats]);

  const handleSend = () => {
    if (input.trim() === "") return;
    const newMessage = {
      id: Date.now(),
      sender: currentUser,
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    postMessage(newMessage);
    setInput("");
  };


  const handleDelete = async () => {
  if (!selectedMessage) return;

  const chatId = [currentUser.id, user.id].sort().join('_');

  try {
    // Find the key of the message to delete (you'll need to fetch messages with keys)
    const response = await fetch(
      `https://default-de818-default-rtdb.firebaseio.com/Chats/${chatId}.json`
    );
    const data = await response.json();

    const targetKey = Object.entries(data).find(
      ([_, value]) => value.id === selectedMessage.id
    )?.[0];

    if (!targetKey) {
      console.warn("Message key not found");
      return;
    }

    await fetch(
      `https://default-de818-default-rtdb.firebaseio.com/Chats/${chatId}/${targetKey}.json`,
      {
        method: "DELETE",
      }
    );

    setChats((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    setSelectedMessage(null);
  } catch (error) {
    console.error("Failed to delete message:", error);
  }
  };


  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "red", fontSize: 16 }}>
          Error: No user provided!
        </Text>
      </View>
    );
  }

const renderItem = ({ item }) => (
  <TouchableOpacity
    onLongPress={() => setSelectedMessage(item)}
    activeOpacity={0.9}
  >
    <View
      style={[
        styles.messageBubble,
        item.sender.id === currentUser.id
          ? styles.myMessage
          : styles.theirMessage,
        selectedMessage?.id === item.id && styles.selectedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "android" ? "height" : "padding"}
      keyboardVerticalOffset={50}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{user.name}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedMessage && (
      <View style={styles.deleteBar}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedMessage(null)}>
          <Text style={{ color: "#999", padding: 10 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    padding: 16,
    backgroundColor: "#1877f2",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  messagesContainer: { padding: 12, paddingBottom: 12 },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  myMessage: {
    backgroundColor: "#1877f2",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  messageText: { color: "#222", fontSize: 16 },
  messageTime: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  sendButton: {
    backgroundColor: "#1877f2",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  selectedMessage: {
  borderColor: "darkblue",
  borderWidth: 2,
},
deleteBar: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 12,
  backgroundColor: "#fff0f0",
  borderTopWidth: 1,
  borderColor: "#ddd",
},
deleteButton: {
  backgroundColor: "#ff4d4f",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
},
deleteButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},


});
