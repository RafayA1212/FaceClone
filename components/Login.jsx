import { useState, useEffect } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState([]);


      async function fetchProfiles(){
        const response = await fetch('https://default-de818-default-rtdb.firebaseio.com/Profiles.json');
        const data = await response.json();
        const profilesArray = [];
        for(const key in data){
            const profileData ={
                id : key,
                name: data[key].name || "Unnamed",
                profilePic: { uri: data[key].profilePic || "https://via.placeholder.com/50" }, // fallback image
                email : data[key].email,
                password : data[key].password,
            }
            profilesArray.push(profileData);
        }
        setProfiles(profilesArray);
    }
        useEffect(()=>{
        fetchProfiles();
        },[]);


  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    const matchedProfile = profiles.find((profile) => profile.email == email && profile.password == password)
    if(matchedProfile) {
      navigation.navigate("Friends", {liu : matchedProfile});
    }
    

  };

  return (
    <View style={styles.container}>
 

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 32,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#00376b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },



  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#888',
    fontSize: 15,
  },
  signupLink: {
    color: '#3897f0',
    fontWeight: 'bold',
    fontSize: 15,
  },
});