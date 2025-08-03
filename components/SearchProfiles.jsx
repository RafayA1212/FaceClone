import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SearchProfiles({ navigation, liu }) {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState([]);

  async function fetchProfiles() {
    try {
      const response = await fetch(
        "https://default-de818-default-rtdb.firebaseio.com/Profiles.json"
      );
      const data = await response.json();
      const profilesArray = [];

      for (const key in data) {
        const profileData = {
          id: key,
          email: data[key].email,
          password: data[key].password,
          name: data[key].name || "Unnamed", // ensure name exists
          profilePic: { uri: data[key].profilePic || "https://via.placeholder.com/50" }, // fallback image
        };
        profilesArray.push(profileData);
      }

      setProfiles(profilesArray);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  const otherUsers = profiles.filter(
    (profile) => profile.id !== liu.id
  );

  const filteredProfiles = query.trim()
    ? otherUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() =>
        navigation.navigate("ProfilePage", {
          user: item,
          liu: liu,
        })
      }
    >
      <Image source={item.profilePic} style={styles.profilePic} />
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a profile..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredProfiles}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No profiles found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
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
});
