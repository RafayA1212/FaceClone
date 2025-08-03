import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function FriendsRequests({ route }) {
  const [requests, setRequests] = useState([]);
  const currentUser = route.params?.liu;

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/FriendRequests/${currentUser.id}.json`
      );
      const data = await response.json();
      if (!data) {
        setRequests([]);
        return;
      }

      const requestsArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));

      setRequests(requestsArray);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (user) => {
    try {
      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/Friends/${currentUser.id}/${user.id}.json`,
        {
          method: "PUT",
          body: JSON.stringify(user),
        }
      );

      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/Friends/${user.id}/${currentUser.id}.json`,
        {
          method: "PUT",
          body: JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            profilePic: currentUser.profilePic,
          }),
        }
      );

      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/FriendRequests/${currentUser.id}/${user.id}.json`,
        {
          method: "DELETE",
        }
      );

      setRequests((prev) => prev.filter((req) => req.id !== user.id));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch(
        `https://default-de818-default-rtdb.firebaseio.com/FriendRequests/${currentUser.id}/${id}.json`,
        {
          method: "DELETE",
        }
      );
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.profilePic ? (
        <Image source={{ uri: item.profilePic }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: "#ccc" }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name ? item.name : "Unknown User"}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item)}
          >
            <Text style={styles.btnText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={styles.empty}>No Friend Requests</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
