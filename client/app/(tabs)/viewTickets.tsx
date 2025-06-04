import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  FlatList,
} from "react-native";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { TicketBooked } from "./components/Icons";
import { Image } from "expo-image";

const { width: screenWidth } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("window");

const TicketsScreen = () => {
  const { serverIP } = useAuth();
  const { user } = useAuth();
  const email = user?.email || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (email) {
      fetchTickets();
    }
  }, [email]);

  useEffect(() => {
    if (flatListRef.current && tickets.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: screenWidth * 0.35,
          animated: true,
        });

        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }, 300);
      }, 500);
    }
  }, [tickets]);

  const fetchTickets = async () => {
    try {
      if (!email) {
        console.warn("User email is missing.");
        return;
      }

      const response = await axios.get(`${serverIP}/getTickets`, {
        params: { email },
        timeout: 5000,
      });

      setTickets(response.data);
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Your Tickets</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 0,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : tickets.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={tickets}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              snapToInterval={screenWidth}
              decelerationRate="fast"
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 0,
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <View style={styles.ticketCard}>
                  <TicketBooked width={345} height={480} />
                  {item.eventID ? (
                    <View style={styles.ticketInfo}>
                      {item.eventID.imageUrl && (
                        <Image
                          source={{
                            uri: item.eventID.imageUrl?.startsWith("http")
                              ? item.eventID.imageUrl
                              : `${serverIP}${item.eventID.imageUrl}`,
                          }}
                          style={styles.ticketImage}
                        />
                      )}
                      <Text style={styles.ticketTitle}>
                        {item.eventID.title}
                      </Text>
                      <Text style={styles.boldtxt}>
                        --------------------------------
                      </Text>
                      <View style={styles.info}>
                        <View style={styles.detailswrap}>
                          <Text style={styles.infobold}>Date</Text>
                          <Text style={styles.infobold}>Time</Text>
                        </View>
                        <View style={styles.detailswrap}>
                          <Text style={styles.infoboldDark}>
                            {new Date(item.eventID.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </Text>
                          <Text style={styles.infoboldDark}>
                            {item.eventID.time}PM
                          </Text>
                        </View>
                      </View>
                      <View style={styles.info}>
                        <View style={styles.detailswrap}>
                          <Text style={styles.infobold}>Location</Text>
                          <Text style={styles.infobold}>Quantity</Text>
                        </View>
                        <View style={styles.detailswrap}>
                          <Text style={styles.infoboldDark}>
                            {item.eventID.city}
                          </Text>
                          <Text style={styles.infoboldDark}>
                            {item.quantity}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.boldtxt2}>
                        --------------------------------
                      </Text>
                      <Image
                        source={require("../../assets/images/barcode.png")}
                        style={{
                          width: 250,
                          height: 54,
                          marginTop: 2,
                          alignSelf: "center",
                        }}
                      />
                    </View>
                  ) : (
                    <Text style={styles.noTicketsText}>
                      Event details not available
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {tickets.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.noTicketsText}>
            No tickets found. Pull down to refresh.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexGrow: 1,
    backgroundColor: "#111111",
  },
  headerContainer: {
    backgroundColor: "#111111",
    width: "100%",
    paddingTop: 45,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    paddingTop: 45,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FFFFFF",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#111111",
  },
  carouselContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ticketCard: {
    alignItems: "center",
    width: screenWidth,
    paddingHorizontal: screenWidth * 0.05,
  },

  ticketInfo: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
  },
  ticketImage: {
    width: 295,
    height: 161,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    alignSelf: "center",
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111111",
  },
  noTicketsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  pagination: {
    flexDirection: "row",
    marginTop: 50,
    marginBottom: 100,
    alignSelf: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#CAFD00",
  },
  boldtxt: {
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 17,
  },
  boldtxt2: {
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 17,
    marginTop: -10,
  },
  detailswrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 50,
    marginRight: 50,
  },
  infobold: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#989898",
    marginBottom: 3,
  },
  infoboldDark: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000000",
    marginTop: 2,
  },
  info: {
    marginTop: 20,
    marginBottom: 33,
  },
});

export default TicketsScreen;
