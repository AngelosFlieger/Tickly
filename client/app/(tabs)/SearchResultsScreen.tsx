import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { SearchIcon } from "./components/Icons";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const SearchResultsScreen = () => {
  const { user, serverIP } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query || "");

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${serverIP}/searchEvents?query=${searchQuery}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      Alert.alert("Error", "Could not fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    fetchSearchResults();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
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
            onSubmitEditing={handleSearch}
          />
          <View style={styles.searchIconContainer}>
            <SearchIcon size={22} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.resultsCountText}>
          {results.length} result{results.length === 1 ? "" : "s"} found
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#CAFD00" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={fetchSearchResults}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => {
                const destination =
                  user?.email === "admin"
                    ? "EventViewsScreen"
                    : "EventDetailScreen";
                navigation.navigate(destination, { event: item });
              }}
            >
              {item.imageUrl && (
                <Image
                  source={{
                    uri: item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `${serverIP}${item.imageUrl}`,
                  }}
                  style={styles.eventImage}
                  contentFit="cover"
                  placeholder={require("../../assets/images/placeholder.png")}
                />
              )}
              <View style={styles.eventDetailsContainer}>
                <View>
                  <Text style={styles.eventTitle} numberOfLines={1}>
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
                  <Text style={styles.eventPrice}>{item.price}$</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    paddingBottom: 20,
  },
  headerWrapper: {
    backgroundColor: "#111111",
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    height: 47,
  },
  searchIconContainer: {
    padding: 10,
  },
  resultsCountText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 15,
    alignSelf: "center",
    marginBottom: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  eventCard: {
    borderRadius: 10,
    marginBottom: 15,
    width: screenWidth / 2.3,
    overflow: "hidden",
  },
  eventImage: {
    height: 220,
    width: "auto",
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 15,
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
  eventPrice: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  eventPriceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  eventDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noResultsText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 16,
    marginTop: 30,
  },
});

export default SearchResultsScreen;
