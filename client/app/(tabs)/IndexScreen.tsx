import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function IndexScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.bcContainer}>
        <Image
          source={require("../../assets/images/welcome.jpg")}
          style={styles.bc}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>tick.ly</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Text style={styles.slogan}>
          Get your Tickets Easily, with{" "}
          <Text style={styles.sloganhigh}>tick.ly</Text>
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("signup")}
        >
          <Text style={styles.loginText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.signupText}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111111",
  },
  title: {
    fontSize: 36,
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bcContainer: {
    position: "absolute",
    alignItems: "center",
  },
  bc: {
    width: screenWidth,
    height: screenHeight,
    alignSelf: "center",
    position: "absolute",
    opacity: 0.5,
  },
  slogan: {
    textAlign: "left",
    fontSize: 55,
    color: "#FFFFFF",
    fontWeight: "400",
    marginLeft: 20,
    marginRight: 20,
  },
  sloganhigh: {
    color: "#CAFD00",
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 60,
    gap: 20,
  },
  loginButton: {
    width: "90%",
    backgroundColor: "#CAFD00",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#111111",
    fontWeight: "bold",
    fontSize: 16,
    padding: 2,
  },
  signupButton: {
    width: "90%",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  signupText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    padding: 2,
  },
  content: {
    marginTop: 80,
    alignItems: "center",
  },
});
