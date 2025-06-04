import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { BackIcon } from "./components/Icons";
import { Image } from "expo-image";

const screenWidth = Dimensions.get("window").width;

export default function EventDetailScreen() {
  const { serverIP } = useAuth();
  const route = useRoute();
  const { event } = route.params || {};
  const { user } = useAuth();
  const navigation = useNavigation();
  const [latestEvents, setLatestEvents] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchLatestEvents();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [event]);

  const fetchLatestEvents = async () => {
    try {
      const response = await axios.get(`${serverIP}/eventRoute`);
      const runningEvents = response.data.filter(
        (e) => e.status === "running" && e._id !== event._id
      );
      const sortedByDate = runningEvents.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLatestEvents(sortedByDate.slice(0, 10));
    } catch (error) {
      console.error("Error fetching latest events:", error);
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Event not found.</Text>
      </View>
    );
  }

  const bookTicket = async () => {
    try {
      if (!user || !user.email) {
        Alert.alert("Error", "User email is missing. Please log in again.");
        return;
      }

      const response = await axios.post(`${serverIP}/bookTicket`, {
        email: user.email,
        eventID: event._id,
      });

      Alert.alert("Success", "Ticket booked successfully!");
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
          style={styles.backButtonWrapper}
        >
          <View style={styles.backButton}>
            <BackIcon size={24} color="#e8eaed" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>{event.title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        ref={scrollRef}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: event.imageUrl.startsWith("http")
                ? event.imageUrl
                : `${serverIP}${event.imageUrl}`,
            }}
            style={styles.eventImage}
          />
          <LinearGradient
            colors={["transparent", "#111111"]}
            style={styles.gradientOverlay}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.infowrap}>
            <Text style={styles.infobold}>{event.title}</Text>
            <Text style={styles.infobold}>
              {new Date(event.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.infowrap}>
            <Text style={styles.infotra}>{event.city}</Text>
            <Text style={styles.infotra}>Starts at: {event.time}PM</Text>
          </View>
          <Text style={styles.descriptionbold}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
          <Text style={styles.descriptionbold}>Location</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: event.lat,
              longitude: event.lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: event.lat, longitude: event.lon }}
              title={event.title}
              description={event.location}
              pinColor="#CAFD00"
            />
          </MapView>
        </View>

        <Text style={styles.descriptionbold2}>More Events</Text>

        <FlatList
          data={latestEvents}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.eventCard, { width: 200, marginRight: 15 }]}
              onPress={() =>
                navigation.replace("EventDetailScreen", { event: item })
              }
            >
              {item.imageUrl && (
                <Image
                  source={{
                    uri: item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `${serverIP}${item.imageUrl}`,
                  }}
                  style={[styles.moreEventImage, { width: "100%" }]}
                  contentFit="cover"
                />
              )}
              <View style={styles.moreEventDetails}>
                <View style={styles.eventInfo}>
                  <Text
                    style={styles.moreEventTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.moreEventCity}>{item.city}</Text>
                  <Text style={styles.moreEventDate}>
                    {new Date(item.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.moreEventPriceWrapper}>
                  <Text style={styles.moreEventPrice}>{item.price}$</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("Checkout", { event })}
        >
          <Text style={styles.bookButtonText}>Book Now {event.price}$</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  imageContainer: { position: "absolute", width: "100%", height: 460 },
  eventImage: { width: "100%", height: "100%" },
  moreEventImage: { height: 300, borderRadius: 10 },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 189,
  },
  description: {
    marginLeft: 0,
    marginRight: 0,
    fontSize: 16,
    textAlign: "left",
    marginBottom: 30,
    color: "#FFFFFF",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e63946",
    marginBottom: 20,
  },
  mapContainer: {
    width: screenWidth * 0.9,
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 30,
    alignSelf: "center",
  },
  map: { flex: 1 },
  scrollContainer: { paddingBottom: 140 },
  header: {
    width: "100%",
    height: 103,
    backgroundColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
    paddingTop: 40,
  },
  backButtonWrapper: {
    position: "absolute",
    left: 20,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  backButton: { justifyContent: "center", alignItems: "center" },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 8,
  },
  bookButton: {
    width: 320,
    height: 59,
    backgroundColor: "#CAFD00",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  bookButtonText: { fontSize: 16, fontWeight: "bold", color: "#111111" },
  details: { marginTop: 400, paddingHorizontal: 20 },
  infowrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 0,
    marginRight: 0,
  },
  infobold: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 7,
  },
  infotra: {
    fontWeight: "thin",
    color: "#B0B0B0",
    fontSize: 13,
    marginBottom: 35,
  },
  descriptionbold: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 0,
    marginBottom: 17,
  },
  descriptionbold2: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 20,
    marginBottom: 17,
  },
  eventCard: { borderRadius: 10, marginBottom: 0, overflow: "hidden" },
  moreEventDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  eventInfo: { flex: 1, paddingRight: 5 },
  moreEventTitle: { fontSize: 12, color: "#FFFFFF" },
  moreEventCity: { fontSize: 12, color: "#AAAAAA", marginTop: 4 },
  moreEventDate: { fontSize: 12, color: "#AAAAAA", marginTop: 4 },
  moreEventPriceWrapper: { justifyContent: "center", alignItems: "flex-end" },
  moreEventPrice: { fontSize: 12, color: "#FFFFFF", fontWeight: "600" },
});
