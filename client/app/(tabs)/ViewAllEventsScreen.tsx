import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { SearchIcon } from "./components/Icons";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext";

const screenWidth = Dimensions.get("window").width;

export default function ViewAllEventsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { events, title } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { serverIP } = useAuth();

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetailScreen", { event: item })}
    >
      <Image
        source={{
          uri: item.imageUrl.startsWith("http")
            ? item.imageUrl
            : `${serverIP}${item.imageUrl}`,
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventDetailsContainer}>
        <View>
          <Text
            style={styles.eventTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text style={styles.eventCity}>{item.city}</Text>
          <Text style={styles.eventTitle}>
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.eventPriceContainer}>
          <Text style={styles.eventPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#CCCCCC"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
        <View style={styles.searchIconContainer}>
          <SearchIcon size={22} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.resultCount}>{filteredEvents.length} results</Text>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111111",
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    height: 47,
  },
  searchIconContainer: {
    padding: 10,
  },
  resultCount: {
    color: "#CCCCCC",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  eventCard: {
    borderRadius: 10,
    width: screenWidth / 2.3,
    overflow: "hidden",
  },
  eventImage: {
    height: 220,
    width: "auto",
    resizeMode: "cover",
    marginBottom: 15,
    borderRadius: 10,
  },
  eventDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 12,
    color: "#FFFFFF",
    maxWidth: 120,
  },
  eventCity: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  eventPriceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  eventPrice: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});
