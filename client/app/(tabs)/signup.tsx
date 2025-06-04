import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import { useState } from "react";
import axios from "axios";
import {
  ShowPasswordIcon,
  HidePasswordIcon,
  BackIcon,
} from "./components/Icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootParamList } from "../types";
import { useAuth } from "../AuthContext";

const screenHeight = Dimensions.get("window").height;
type NavigationProp = StackNavigationProp<RootParamList, "TabNavigator">;

function Signup() {
  const { serverIP } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");

  const handleSubmit = () => {
    if (!email || !password || !name || !city || !gender || !age) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const userData = {
      email,
      name,
      password,
      city,
      gender,
      age: parseInt(age),
    };

    if (emailVerify && passwordVerify) {
      axios
        .post(`${serverIP}/signup`, userData)
        .then((res) => {
          if (res.data.status === "ok") {
            Alert.alert("Registration Successful!");
            setEmail("");
            setPassword("");
            setCity("");
            setName("");
            setGender("Male");
            setAge("");
          } else {
            Alert.alert("Error", res.data.error || "Something went wrong");
          }
        })
        .catch((e) => {
          console.error("Signup Error:", e);
          Alert.alert("Error", "Failed to register user");
        });
    }
  };

  const handleEmail = (val: string) => {
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(val)) {
      setEmailVerify(false);
      Alert.alert("Invalid Email", "Please enter a valid email address.");
    } else {
      setEmailVerify(true);
    }
  };

  const handlePassword = (val: string) => {
    setPassword(val);
    setPasswordVerify(val.length > 1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonWrapper}
          >
            <View style={styles.backButton}>
              <BackIcon size={24} color="#e8eaed" />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter email"
            placeholderTextColor="#CECECE"
            style={styles.input}
            onChangeText={setEmail}
            onBlur={() => handleEmail(email)}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#CECECE"
            style={styles.input}
            onChangeText={setName}
            value={name}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#CECECE"
              style={styles.passwordInput}
              onChangeText={handlePassword}
              value={password}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.icon}
            >
              {showPassword ? (
                <ShowPasswordIcon size={22} color="#111111" />
              ) : (
                <HidePasswordIcon size={22} color="#111111" />
              )}
            </Pressable>
          </View>

          <Text style={styles.label}>City</Text>
          <TextInput
            placeholder="Enter city"
            placeholderTextColor="#CECECE"
            style={styles.input}
            onChangeText={setCity}
            value={city}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="Enter age"
            placeholderTextColor="#CECECE"
            style={styles.input}
            onChangeText={setAge}
            value={age}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={styles.genderOption}
              >
                <View style={styles.radioCircle}>
                  {gender === g && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={styles.alt}>
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("login")}>
            <Text
              style={{
                color: "#CAFD00",
                fontWeight: "bold",
                fontSize: 12,
                textDecorationLine: "underline",
                paddingLeft: 3,
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  headerContainer: {
    backgroundColor: "#111111",
    width: "100%",
    paddingTop: 35,
    alignItems: "center",
    position: "relative",
  },
  backButtonWrapper: {
    position: "absolute",
    left: 20,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 92,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    paddingTop: 45,
    fontSize: 20,
    marginBottom: 40,
    color: "#FFFFFF",
  },
  inputContainer: {
    width: "90%",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    padding: 16,
    color: "#111111",
    fontSize: 14,
    marginBottom: 20,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    paddingVertical: 16,
  },
  icon: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 30,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CAFD00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#CAFD00",
  },
  radioLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#CAFD00",
    width: "90%",
    borderRadius: 7,
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  alt: {
    flexDirection: "row",
    top: screenHeight - 50,
    position: "absolute",
  },
});

export default Signup;
