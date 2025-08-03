import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import SearchProfiles from "./SearchProfiles";

export default function Friends({ navigation, route }) {
  const { liu } = route.params;
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!liu?.id) return;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `https://default-de818-default-rtdb.firebaseio.com/Friends/${liu.id}.json`
        );
        const data = await response.json();
        const friendsArray = data ? Object.values(data) : [];
        setFriends(friendsArray);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };

    fetchFriends();
  }, [liu]);

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendRow}
      onPress={() =>
        navigation.navigate("ProfilePage", { user: item, liu: liu })
      }
    >
      <Image source={item.profilePic} style={styles.friendImage} />
      <Text style={styles.friendName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() =>
          navigation.navigate("Message", { user: item, currentUser: liu })
        }
      >
        <Text style={styles.messageText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderFriend}
          ListHeaderComponent={
            <>
              <SearchProfiles navigation={navigation} liu={liu} />
              <Text style={styles.title}>Your Friends</Text>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>You don't have any friends.</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.container}
        />

        <View style={styles.friendRequestButtonWrapper}>
          <TouchableOpacity
            style={styles.friendRequestButton}
            onPress={() => navigation.navigate("FriendRequests", { liu })}
          >
            <Text style={styles.friendRequestText}>Check Friend Requests</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100, // extra space for button
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1877f2",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  messageButton: {
    backgroundColor: "#1877f2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 10,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
  },
  friendRequestButtonWrapper: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  friendRequestButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  friendRequestText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
