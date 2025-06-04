import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import axios from "axios";
import { Image } from "expo-image";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { SearchIcon, LogoutIcon } from "./components/Icons";

export default function EventListingScreen() {
  const { serverIP, setUser } = useAuth();
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${serverIP}/eventRoute`);
      setEvents(response.data.filter((event) => event.status === "running"));
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    navigation.navigate("EventViewsScreen", { event });
  };

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

  const handleSearch = () => {
    navigation.navigate("SearchResultsScreen", { query: searchQuery });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      {/* Sticky header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerWrapper}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <LogoutIcon size={18} color="red" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <SearchIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.newEventButton}
          onPress={() => navigation.navigate("createEvent")}
        >
          <Text style={styles.newEventText}>Add new event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />
        }
      >
        <Text style={styles.subtitle}>{events.length} active events</Text>

        <View style={styles.gridWrapper}>
          {events.map((event) => (
            <TouchableOpacity
              key={event._id}
              style={styles.card}
              onPress={() => handleEventClick(event)}
            >
              <Image
                source={{
                  uri: event.imageUrl.startsWith("http")
                    ? event.imageUrl
                    : `${serverIP}${event.imageUrl}`,
                }}
                style={styles.image}
              />
              <View style={styles.cardInfo}>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.cardCity}>{event.city}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text style={styles.cardPrice}>{event.price}$</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#111111",
  },
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1C21",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  searchInput: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
  },
  newEventButton: {
    backgroundColor: "#CAFD00",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  newEventText: {
    fontWeight: "bold",
    color: "#111",
    fontSize: 16,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 15,
  },
  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
  },
  cardInfo: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardDetails: {
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  cardCity: {
    fontSize: 12,
    color: "#CCCCCC",
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 10,
  },
  stickyHeader: {
    backgroundColor: "#111111",
    paddingBottom: 10,
  },
  fixedHeader: {
    backgroundColor: "#111111",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    zIndex: 10,
  },

  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
