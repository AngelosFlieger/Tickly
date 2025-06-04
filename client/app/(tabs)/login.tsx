import React, { useState } from "react";
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
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootParamList } from "../types";
import { useAuth } from "../AuthContext";
import {
  ShowPasswordIcon,
  HidePasswordIcon,
  BackIcon,
} from "./components/Icons";

type NavigationProp = StackNavigationProp<RootParamList, "TabNavigator">;

const { height: screenHeight } = Dimensions.get("window");

function Login() {
  const { serverIP, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password.");
      return;
    }

    axios
      .post(`${serverIP}/login`, { email, password })
      .then((res) => {
        if (res.data.status === "ok") {
          const userData = res.data.user;
          setUser(userData);

          email.toLowerCase() === "admin"
            ? navigation.navigate("deleteEvents")
            : navigation.navigate("TabNavigator");
        } else {
          Alert.alert("Error", res.data.error || "Something went wrong");
        }
      })
      .catch((e) => {
        const errorMessage =
          e.response?.data?.error || "Please check your internet connection.";
        Alert.alert("Login Failed", errorMessage);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {/* ✅ Back Button Implementation */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonWrapper}
          >
            <View style={styles.backButton}>
              <BackIcon size={24} color="#e8eaed" />
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Sign in</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.liltext}>Email</Text>
          <TextInput
            placeholder="Enter Email"
            placeholderTextColor="#CECECE"
            style={styles.input}
            onChangeText={setEmail}
          />

          <Text style={styles.liltext}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter Password"
              placeholderTextColor="#CECECE"
              style={[styles.input, styles.passwordInput]}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
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
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <View style={styles.alt}>
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("signup")}>
            <Text
              style={{
                color: "#CAFD00",
                fontWeight: "bold",
                fontSize: 12,
                textDecorationLine: "underline",
                paddingLeft: 3,
              }}
            >
              Sign Up
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
    marginBottom: 20,
    color: "#FFFFFF",
  },
  inputContainer: {
    width: "90%",
    justifyContent: "center",
    top: screenHeight * 0.17,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    padding: 19,
    textAlign: "left",
    color: "#111111",
    fontSize: 14,
    marginBottom: 30,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 30,
  },
  passwordInput: {
    paddingRight: 50,
  },
  icon: {
    position: "absolute",
    paddingBottom: 30,
    marginLeft: "88%",
  },
  button: {
    backgroundColor: "#CAFD00",
    width: "90%",
    borderRadius: 7,
    paddingVertical: 12,
    marginTop: 30,
    top: screenHeight * 0.17,
  },
  buttonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    margin: 8,
  },
  liltext: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 8,
  },
  alt: {
    flexDirection: "row",
    top: screenHeight - 70,
    position: "absolute",
  },
});

export default Login;
