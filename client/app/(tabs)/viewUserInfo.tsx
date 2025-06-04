import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { ProfileIcon, LogoutIcon, DeleteIcon } from "./components/Icons";

const { width: screenWidth } = Dimensions.get("window");

const UserInfoScreen: React.FC = () => {
  const { serverIP, user, setUser } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          setUser(null);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "index" }],
            })
          );
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${serverIP}/userRoute/deleteUser/${user?.email}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                Alert.alert("Deleted", "Your account has been deleted.");
                setUser(null);
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "index" }],
                  })
                );
              } else {
                Alert.alert("Error", "Failed to delete account.");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Something went wrong.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Your Profile</Text>
      </View>
      <View style={styles.iconContainer}>
        <View style={styles.profileIconContainer}>
          <ProfileIcon size={54} color="#CAFD00" />
        </View>
      </View>
      <Text style={styles.Text}>{user?.name}</Text>
      <Text style={styles.liltext}>General</Text>

      <View style={styles.detailscontainer}>
        <View style={styles.detailsColumn}>
          <Text style={styles.detailstext}>Email:</Text>
          <Text style={styles.detailstext}>Gender:</Text>
          <Text style={styles.detailstext}>City:</Text>
          <Text style={styles.detailstext}>Age:</Text>
        </View>
        <View style={styles.detailsColumn}>
          <Text style={styles.detailstextbold}>{user?.email}</Text>
          <Text style={styles.detailstextbold}>{user?.gender}</Text>
          <Text style={styles.detailstextbold}>{user?.city}</Text>
          <Text style={styles.detailstextbold}>{user?.age}</Text>
        </View>
      </View>

      <Text style={styles.liltext}>Actions</Text>

      <View style={styles.detailscontainer2}>
        <TouchableOpacity onPress={handleLogout}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.actionIcons}>
              <LogoutIcon size={18} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "#FFFFFF",
                marginBottom: 20,
              }}
            >
              Logout
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ paddingRight: 10, marginLeft: -3 }}>
              <DeleteIcon size={18} color="red" />
            </View>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 17,
                color: "red",
                marginLeft: 3,
              }}
            >
              Delete account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  headerContainer: {
    backgroundColor: "#111111",
    width: "100%",
    paddingTop: 35,
    alignItems: "center",
  },
  title: {
    paddingTop: 45,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#FFFFFF",
  },
  profileIconContainer: {
    padding: 17,
  },
  iconContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 100,
    borderColor: "#CAFD00",
  },
  Text: {
    color: "#FFFFFF",
    fontSize: 20,
    marginTop: 20,
    fontWeight: "bold",
  },
  liltext: {
    color: "#C9C9C9",
    fontWeight: "thin",
    fontSize: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  detailscontainer: {
    backgroundColor: "#1E1C21",
    padding: 30,
    borderRadius: 10,
    width: screenWidth * 0.9,
    alignItems: "center",
    paddingBottom: -20,
    flexDirection: "row",
  },
  detailscontainer2: {
    backgroundColor: "#1E1C21",
    padding: 30,
    borderRadius: 10,
    width: screenWidth * 0.9,
  },
  detailsColumn: {
    alignItems: "flex-start",
    flex: 1,
  },
  detailstext: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "left",
    marginBottom: 20,
  },
  detailstextbold: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "left",
    marginBottom: 20,
    fontWeight: "bold",
  },
  actionIcons: {
    paddingRight: 10,
  },
});

export default UserInfoScreen;
