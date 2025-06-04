import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
} from "react-native";
import axios from "axios";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { SearchIcon } from "./components/Icons";

const screenWidth = Dimensions.get("window").width;

export default function EventListingScreen() {
  const { serverIP } = useAuth();
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [exclusiveEvents, setExclusiveEvents] = useState([]);
  const [fewTicketsLeftEvents, setFewTicketsLeftEvents] = useState([]);
  const [musicEvents, setMusicEvents] = useState([]);
  const [entertainmentEvents, setEntertainmentEvents] = useState([]);
  const [sportsEvents, setSportsEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${serverIP}/eventRoute`);
      const runningEvents = response.data.filter(
        (event) => event.status === "running"
      );
      setEvents(runningEvents);

      const sortedBySales = [...runningEvents].sort((a, b) => {
        const salesA = a.seat_num - a.seats_left;
        const salesB = b.seat_num - b.seats_left;
        return salesB - salesA;
      });
      setTrendingEvents(sortedBySales);

      const sortedByPrice = [...runningEvents].sort(
        (a, b) => a.price - b.price
      );
      setExclusiveEvents(sortedByPrice);

      const sortedByFewLeft = [...runningEvents].sort(
        (a, b) => a.seats_left - b.seats_left
      );
      setFewTicketsLeftEvents(sortedByFewLeft);

      setMusicEvents(runningEvents.filter((event) => event.type === "music"));
      setEntertainmentEvents(
        runningEvents.filter((event) => event.type === "entertainment")
      );
      setSportsEvents(runningEvents.filter((event) => event.type === "sport"));
      setOtherEvents(runningEvents.filter((event) => event.type === "other"));
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Could not fetch events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = async (event) => {
    if (!user || !user._id) {
      Alert.alert("Error", "User not logged in!");
      return;
    }

    try {
      await axios.post(`${serverIP}/trackView`, {
        eventID: event._id,
        userID: user._id,
      });
      navigation.navigate("EventDetailScreen", { event });
    } catch (error) {
      console.error("Error tracking event view:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    navigation.navigate("SearchResults", { query: searchQuery });
  };

  const renderEventCard = (item) => (
    <TouchableOpacity
      key={item._id}
      style={[styles.eventCard, { marginHorizontal: 10 }]}
      onPress={() => handleEventClick(item)}
    >
      {item.imageUrl && (
        <Image
          source={{
            uri: item.imageUrl.startsWith("http")
              ? item.imageUrl
              : `${serverIP}${item.imageUrl}`,
          }}
          style={styles.eventImage}
        />
      )}
      <View style={styles.eventDetailsContainer}>
        <View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTitle}>{item.city}</Text>
          <Text style={styles.eventTitle}>
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.eventPriceContainer}>
          <Text style={styles.eventPrice}>{item.price}$</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <View>
        <Image
          source={require("../../assets/images/bc-home.jpg")}
          style={styles.bc}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "#111111"]}
          style={styles.bcGradientOverlay}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={["transparent"]}
          />
        }
      >
        <Text style={styles.welcomeText}>Hello, {user?.name}</Text>
        <Text style={styles.pageTitle}>Discover Amazing Events</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
            onSubmitEditing={handleSearch}
          />
          <View style={styles.searchIconContainer}>
            <SearchIcon size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.categoryButtonsContainer}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: musicEvents,
                title: "Music Events",
              })
            }
          >
            <Text style={styles.categoryButtonText}>Music</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: entertainmentEvents,
                title: "Entertainment Events",
              })
            }
          >
            <Text style={styles.categoryButtonText}>Entertainment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: sportsEvents,
                title: "Sports Events",
              })
            }
          >
            <Text style={styles.categoryButtonText}>Sports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: otherEvents,
                title: "Other Events",
              })
            }
          >
            <Text style={styles.categoryButtonText}>Other</Text>
          </TouchableOpacity>
        </View>

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: trendingEvents,
                title: "Trending Events",
              })
            }
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={trendingEvents}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          renderItem={({ item }) => renderEventCard(item)}
        />

        {/* Exclusive */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exclusive Deals</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: exclusiveEvents,
                title: "Exclusive Deals",
              })
            }
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={exclusiveEvents}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          renderItem={({ item }) => renderEventCard(item)}
        />

        {/* Few Tickets Left */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Few Tickets Left</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewAllEventsScreen", {
                events: fewTicketsLeftEvents,
                title: "Few Tickets Left",
              })
            }
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={fewTicketsLeftEvents}
          horizontal
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          renderItem={({ item }) => renderEventCard(item)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#111111",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 45,
    marginBottom: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    height: 47,
  },
  searchIconContainer: {
    padding: 10,
  },
  eventCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  eventTitle: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  eventImage: {
    height: 270,
    width: 208,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 15,
  },
  eventDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventPriceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  eventPrice: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 76,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  bc: {
    width: screenWidth,
    height: 400,
    alignSelf: "center",
    position: "absolute",
    top: -110,
    opacity: 0.6,
  },
  bcGradientOverlay: {
    position: "absolute",
    top: 130,
    width: screenWidth,
    height: 180,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  viewAll: {
    fontSize: 12,
    color: "#FFFFFF",
    textDecorationLine: "underline",
    paddingBottom: 2,
  },
  categoryButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  categoryButton: {
    borderColor: "#CAFD00",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryButtonText: {
    color: "#CAFD00",
    fontSize: 12,
  },
  pageTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#FFFFFF",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
});
