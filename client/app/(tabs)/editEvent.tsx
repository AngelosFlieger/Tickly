import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { BackIcon } from "./components/Icons";

export default function EditEventScreen() {
  const { serverIP } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params;

  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [type, setType] = useState(event.type || "music");
  const [showDropdown, setShowDropdown] = useState(false);
  const [date, setDate] = useState(event.date || "");
  const [time, setTime] = useState(event.time || "");
  const [priceMin, setPriceMin] = useState(event.price_min.toString());
  const [priceMax, setPriceMax] = useState(event.price_max.toString());
  const [startPrice, setStartPrice] = useState(event.price.toString());

  const submitForm = async () => {
    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !priceMin ||
      !priceMax ||
      !startPrice
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const updatedEvent = {
      title,
      description,
      type,
      date,
      time,
      price_min: Number(priceMin),
      price_max: Number(priceMax),
      price: Number(startPrice),
    };

    try {
      await axios.put(`${serverIP}/eventRoute/${event._id}`, updatedEvent);
      Alert.alert("Success", "Event updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      Alert.alert("Error updating event");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111111" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackIcon size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Event</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          multiline
          placeholder="type here..."
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
        />

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

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#aaa"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:mm"
          placeholderTextColor="#aaa"
          value={time}
          onChangeText={setTime}
        />

        <Text style={styles.label}>Prices</Text>
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
            placeholder="Min price"
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
          <Text style={styles.submitText}>Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#111111",
  },
  header: {
    height: 50,
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  backButton: {
    position: "absolute",
    left: 10,
    zIndex: 10,
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
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
  dropdownWrapper: {
    borderRadius: 8,
    backgroundColor: "#1E1C21",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },
  dropdownMenu: {
    backgroundColor: "#1E1C21",
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 14,
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
    marginTop: 60,
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
});
