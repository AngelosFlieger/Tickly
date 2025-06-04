import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BackIcon, PayPalIcon, CreditCardIcon } from "./components/Icons";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;

export default function CheckoutScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params;
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [agree, setAgree] = useState(false);
  const { user, serverIP } = useAuth();

  const increaseTickets = () => setTicketCount(ticketCount + 1);
  const decreaseTickets = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1);
  };

  const handleCheckout = async () => {
    if (!agree) {
      Alert.alert("Error", "You must agree to the terms before proceeding.");
      return;
    }

    try {
      if (!user || !user.email) {
        Alert.alert("Error", "User email is missing. Please log in again.");
        return;
      }

      const response = await axios.post(`${serverIP}/bookTicket`, {
        email: user.email,
        eventID: event._id,
        quantity: ticketCount,
      });

      if (response.data?.success) {
        Alert.alert("Success", `Booked ${ticketCount} ticket(s)!`);
        navigation.goBack();
      } else {
        Alert.alert("Success", `Booked ${ticketCount} ticket(s)!`);
        navigation.goBack();
      }
    } catch (error) {
      console.error(
        "Error booking ticket:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.error || "Could not book the ticket."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButtonWrapper,
            { position: "absolute", left: 20, top: 40 },
          ]}
        >
          <View style={styles.backButton}>
            <BackIcon size={24} color="#e8eaed" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerText}>Checkout</Text>
      </View>

      <View style={styles.eventRow}>
        <Image
          source={{
            uri: event.imageUrl.startsWith("http")
              ? event.imageUrl
              : `${serverIP}${event.imageUrl}`,
          }}
          style={styles.eventImage}
        />

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
          <Text style={styles.eventDate}>
            {new Date(event.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.eventLocation}>{event.price}$</Text>
        </View>
        <View style={styles.ticketCounter}>
          <TouchableOpacity
            onPress={decreaseTickets}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.ticketNumber}>{ticketCount}</Text>
          <TouchableOpacity
            onPress={increaseTickets}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Payment Method:</Text>

        {/* Credit Card */}
        <View style={styles.paymentRow}>
          <View style={{ paddingRight: 10 }}>
            <CreditCardIcon size={32} />
          </View>
          <Text style={styles.paymentText}>Credit Card</Text>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setPaymentMethod("Credit Card")}
          >
            <View
              style={[
                styles.radioOuter,
                paymentMethod === "Credit Card" && styles.radioOuterSelected,
              ]}
            >
              {paymentMethod === "Credit Card" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* PayPal */}
        <View style={styles.paymentRow}>
          <View style={{ paddingRight: 10 }}>
            <PayPalIcon size={32} />
          </View>
          <Text style={styles.paymentText}>PayPal</Text>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setPaymentMethod("PayPal")}
          >
            <View
              style={[
                styles.radioOuter,
                paymentMethod === "PayPal" && styles.radioOuterSelected,
              ]}
            >
              {paymentMethod === "PayPal" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setAgree(!agree)}
        style={styles.checkboxContainer}
      >
        <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
          {agree && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to the Terms and Conditions
        </Text>
      </TouchableOpacity>
      <View style={styles.footerContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Pay</Text>
          <Text style={styles.totalAmount}>${ticketCount * event.price}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, !agree && { opacity: 0.5 }]}
          onPress={handleCheckout}
          disabled={!agree}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    padding: 20,
  },
  backButtonWrapper: {},
  backButton: {},
  header: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#1E1C21",
    borderRadius: 10,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  ticketCounter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  counterButton: {
    width: 20,
    height: 20,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  ticketNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    marginHorizontal: 10,
  },
  paymentOption: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333333",
  },
  paymentOptionSelected: {
    backgroundColor: "#CAFD00",
  },
  paymentOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 70,
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CAFD00",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#CAFD00",
  },
  checkmark: {
    color: "#111111",
    fontWeight: "bold",
    fontSize: 14,
  },
  checkboxLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  checkoutButton: {
    marginTop: 30,
    backgroundColor: "#CAFD00",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111111",
  },
  imageContainer: { width: 120, height: 60 },
  eventRow: {
    flexDirection: "row",
    backgroundColor: "#1E1C21",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 30,
  },

  eventImage: {
    width: 100,
    height: 160,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "#333",
  },

  eventInfo: {
    flex: 1,
    justifyContent: "center",
  },

  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  eventLocation: {
    fontSize: 12,
    color: "#CCCCCC",
    marginBottom: 2,
  },

  eventDate: {
    fontSize: 12,
    color: "#AAAAAA",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 20,
  },

  paymentIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 10,
  },

  paymentText: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
    fontWeight: "bold",
  },

  radioButton: {
    padding: 10,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterSelected: {
    borderColor: "#CAFD00",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CAFD00",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderColor: "#333333",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  totalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  totalAmount: {
    color: "#CAFD00",
    fontSize: 16,
    fontWeight: "bold",
  },
});
