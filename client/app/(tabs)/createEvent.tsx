import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { BackIcon } from "./components/Icons";

export default function AdminScreen() {
  const { serverIP } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [type, setType] = useState("entertainment");
  const [image, setImage] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState("");
  const [seatNum, setSeatNum] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const uploadedUrl = await uploadImage(result.assets[0].uri);
      if (uploadedUrl) setImage(uploadedUrl);
    } catch (error) {
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });
      const response = await axios.post(`${serverIP}/uploadImage`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Upload failed", error);
      return null;
    }
  };

  const getCoordinates = async (location) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: location,
            format: "json",
            limit: 1,
          },
        }
      );

      if (response.data.length === 0) throw new Error("Invalid location");

      const { lat, lon } = response.data[0];
      return { lat, lon };
    } catch (error) {
      Alert.alert("Error", "Invalid location! Please enter a valid address.");
      return null;
    }
  };

  const submitForm = async () => {
    if (
      !title ||
      !description ||
      !location ||
      !startPrice ||
      !priceMin ||
      !priceMax
    ) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }

    const coordinates = await getCoordinates(location);
    if (!coordinates) return;

    try {
      const formData = {
        title,
        description,
        location,
        city,
        type,
        price_min: Number(priceMin),
        price_max: Number(priceMax),
        price: Number(startPrice),
        seat_num: Number(seatNum),
        date: dateTime.toISOString().split("T")[0],
        time: dateTime.toISOString().split("T")[1].substring(0, 5),
        imageUrl: image,
        lat: coordinates.lat,
        lon: coordinates.lon,
        status: "running",
      };

      await axios.post(`${serverIP}/eventRoute`, formData);
      Alert.alert("Success", "Event created successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonWrapper}
          >
            <BackIcon size={24} color="#e8eaed" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Event</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Cover photo</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {image ? (
            <Image
              source={{ uri: `${serverIP}${image}` }}
              style={styles.uploadedImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.browseText}>Browse files</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          multiline
          placeholder="type here..."
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Date/ time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: "#fff" }}>
            {dateTime.toISOString().substring(0, 16).replace("T", " ")}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateTime}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDateTime(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Type</Text>
        <TouchableOpacity
          style={styles.dropdownWrapper}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>{type}</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {["music", "entertainment", "sport", "other"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setType(item);
                  setShowDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter City"
          placeholderTextColor="#aaa"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Number of Seats</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter seat number"
          keyboardType="numeric"
          placeholderTextColor="#aaa"
          value={seatNum}
          onChangeText={setSeatNum}
        />

        <Text style={styles.label}>Pricing</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Start price"
            keyboardType="numeric"
            placeholderTextColor="#aaa"
            value={startPrice}
            onChangeText={setStartPrice}
          />
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Minimum price"
            keyboardType="numeric"
            placeholderTextColor="#aaa"
            value={priceMin}
            onChangeText={setPriceMin}
          />
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Max price"
            keyboardType="numeric"
            placeholderTextColor="#aaa"
            value={priceMax}
            onChangeText={setPriceMax}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={submitForm}>
          <Text style={styles.submitText}>Create</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#111111",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#111111",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#1E1C21",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 10,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  browseText: {
    color: "#CAFD00",
    fontSize: 14,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  picker: {
    color: "#fff",
    backgroundColor: "#1E1C21",
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  priceInput: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#CAFD00",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: {
    color: "#111111",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdownWrapper: {
    backgroundColor: "#1E1C21",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  dropdownText: {
    color: "#fff",
  },
  dropdownMenu: {
    backgroundColor: "#1E1C21",
    borderRadius: 8,
    marginBottom: 15,
    paddingVertical: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: "#fff",
  },
  header: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
    marginTop: 20,
  },
  backButtonWrapper: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -12 }],
    paddingLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
  },
});
