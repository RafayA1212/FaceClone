import { useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePage({ navigation, route }) {
  const viewedProfile = route?.params?.user;
  const currentUser = route?.params?.liu;

  const isCurrentUser = !viewedProfile || viewedProfile.id === currentUser?.id;
  const profileToView = isCurrentUser ? currentUser : viewedProfile;

  const [isFriend, setIsFriend] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isRequestSent, setIsRequestSent] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchFriends = async () => {
      try {
        const response = await fetch(
          `https://default-de818-default-rtdb.firebaseio.com/Friends/${currentUser.id}.json`
        );
        const data = await response.json();
        const friendList = data ? Object.values(data) : [];
        setFriends(friendList);

        if (profileToView) {
          const found = friendList.some(f => f.id === profileToView.id);
          setIsFriend(found);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [currentUser, profileToView]);

  // 📤 Post Friend Request to Firebase
  const postRequest = async (user) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/FriendRequests/${user.id}/${currentUser.id}.json`,
        {
          method: 'PUT',
          body: JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            profilePic: currentUser.profilePic,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send request");

      setIsRequestSent(true);
      Alert.alert("Success", "Friend request sent!");
    } catch (err) {
      console.error("Error posting request:", err);
    }
  };

  // 🧹 Remove friend from Firebase
  const handleUnfriend = async () => {
    try {
      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/Friends/${currentUser.id}/${profileToView.id}.json`,
        { method: 'DELETE' }
      );

      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/Friends/${profileToView.id}/${currentUser.id}.json`,
        { method: 'DELETE' }
      );

      setFriends(prev => prev.filter(f => f.id !== profileToView.id));
      setIsFriend(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  };

  // 🧑🏽‍🤝‍🧑🏽 Friend Renderer
  const renderFriend = ({ item }) => {
    if (item.id === profileToView.id) return null;

    return (
      <TouchableOpacity
        style={styles.friendContainer}
        onPress={() => navigation.push("ProfilePage", { user: item, liu: currentUser })}
      >
        <Image source={item.profilePic} style={styles.profilePicSmall} />
        <Text style={styles.friendName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const filteredFriends = isCurrentUser
    ? friends
    : friends.filter(f => f.id !== profileToView?.id);

  if (!profileToView) return <Text style={{ padding: 20 }}>Loading profile...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverContainer}>
        <Image source={profileToView.coverPhoto} style={styles.coverPhoto} />
        <View style={styles.profilePicContainer}>
          <Image source={profileToView.profilePic} style={styles.profilePic} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{profileToView.name}</Text>
        <Text style={styles.bio}>{profileToView.bio}</Text>

        {!isCurrentUser && (
          <View style={styles.buttonRow}>
            {isFriend ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ff4d4f" }]}
                onPress={handleUnfriend}
              >
                <Text style={styles.buttonText}>Unfriend</Text>
              </TouchableOpacity>
            ) : isRequestSent ? (
              <View style={styles.button}>
                <Text style={styles.buttonText}>Request Sent</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => postRequest(profileToView)}
              >
                <Text style={styles.buttonText}>Add Friend</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("Message", {
                  user: profileToView,
                  currentUser: currentUser,
                })
              }
            >
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <FlatList
          data={filteredFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No friends yet.</Text>
          }
        />
      </View>

      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {(profileToView.posts || []).map((post) => (
          <View key={post.id} style={styles.post}>
            <Text>{post.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverContainer: { height: 180, backgroundColor: "#eee" },
  coverPhoto: { width: "100%", height: 180, resizeMode: "cover" },
  profilePicContainer: {
    position: "absolute",
    left: 20,
    bottom: -40,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
  },
  profilePic: { width: 80, height: 80, borderRadius: 40 },
  infoContainer: { marginTop: 50, alignItems: "flex-start", paddingHorizontal: 20 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  bio: { fontSize: 14, color: "#555", marginBottom: 12 },
  buttonRow: { flexDirection: "row", gap: 10 },
  button: {
    backgroundColor: "#1877f2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  friendsSection: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  friendContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 8,
    width: 90,
  },
  profilePicSmall: { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
  friendName: { fontSize: 14, fontWeight: "bold", color: "#222", textAlign: "center" },
  empty: { color: "#888", textAlign: "center", marginTop: 10 },
  postsContainer: { marginTop: 30, paddingHorizontal: 20 },
  post: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
