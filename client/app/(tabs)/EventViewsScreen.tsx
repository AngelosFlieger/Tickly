import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { BackIcon, EditIcon } from "./components/Icons";

const screenWidth = Dimensions.get("window").width;

const EventViewsScreen = () => {
  const { serverIP } = useAuth();
  const route = useRoute();
  const event = route.params?.event;
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [viewFilter, setViewFilter] = useState("month");
  const [salesFilter, setSalesFilter] = useState("month");

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchEventViews(viewFilter),
      fetchTotalViews(),
      fetchEventSales(salesFilter),
      fetchAllTickets(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEventViews(viewFilter);
  }, [viewFilter]);

  useEffect(() => {
    fetchEventSales(salesFilter);
  }, [salesFilter]);

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    fetchTotalViews();
  }, []);
  const fetchTotalViews = async () => {
    try {
      const response = await axios.get(
        `${serverIP}/eventViews/${event._id}?filter=all`
      );
      const allViews = response.data.views || [];
      const total = allViews.reduce((sum, item) => sum + item.count, 0);
      setTotalViews(total);
    } catch (error) {
      console.error("Error fetching total views:", error);
      setTotalViews(0);
    }
  };

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get(`${serverIP}/eventSales/${event._id}`);
      processDemographics(response.data.tickets || []);
    } catch (error) {
      console.error("Error fetching demographic data:", error);
      setGenderData([]);
      setCityData([]);
      setAgeData([]);
    }
  };

  const fetchEventViews = async (timeFilter) => {
    try {
      setLoadingViews(true);
      const response = await axios.get(
        `${serverIP}/eventViews/${event._id}?filter=${timeFilter}`
      );
      setViewData(response.data.views || []);
    } catch (error) {
      console.error("Error fetching event views:", error);
      setViewData([]);
    } finally {
      setLoadingViews(false);
    }
  };

  const fetchEventSales = async (timeFilter) => {
    try {
      setLoadingSales(true);
      const response = await axios.get(
        `${serverIP}/eventSales/${event._id}?filter=${timeFilter}`
      );
      setSalesData(response.data.sales || []);
    } catch (error) {
      console.error("Error fetching event sales:", error);
      setSalesData([]);
    } finally {
      setLoadingSales(false);
    }
  };

  const processDemographics = (tickets) => {
    const genderCounts = { Male: 0, Female: 0, Other: 0 };
    const cityCounts = {};
    const ageBuckets = {
      "Under 18": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45+": 0,
    };

    tickets.forEach((ticket) => {
      const { userGender, userCity, userAge } = ticket;

      if (genderCounts.hasOwnProperty(userGender)) {
        genderCounts[userGender]++;
      }

      if (userCity) {
        cityCounts[userCity] = (cityCounts[userCity] || 0) + 1;
      }

      if (typeof userAge === "number") {
        if (userAge < 18) ageBuckets["Under 18"]++;
        else if (userAge <= 24) ageBuckets["18-24"]++;
        else if (userAge <= 34) ageBuckets["25-34"]++;
        else if (userAge <= 44) ageBuckets["35-44"]++;
        else ageBuckets["45+"]++;
      }
    });

    const genderPie = Object.keys(genderCounts)
      .map((g, i) => ({
        name: g,
        population: genderCounts[g],
        color: ["#CAFD00", "#FF00FF", "#6644FF"][i],
        legendFontColor: "#fff",
        legendFontSize: 12,
      }))
      .filter((item) => item.population > 0);

    const cityBar = {
      labels: Object.keys(cityCounts),
      datasets: [{ data: Object.values(cityCounts) }],
    };

    const ageBar = {
      labels: Object.keys(ageBuckets),
      datasets: [{ data: Object.values(ageBuckets) }],
    };

    setGenderData(genderPie);
    setCityData(cityBar);
    setAgeData(ageBar);
  };

  const getLabels = (data) =>
    data.length > 0
      ? data.map((item) => {
          const parts = item._id.split("-");
          return parts.length === 3 ? parts[2] : item._id;
        })
      : [""];

  const getCounts = (data) =>
    data.length > 0 ? data.map((item) => item.count) : [0];

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Event data not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Statistics</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("editEvent", { event })}
          style={styles.editButton}
        >
          <EditIcon size={20} color="#CAFD00" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#CAFD00"
          />
        }
        style={{ marginTop: 10 }}
      >
        <View style={styles.card}>
          <Text style={styles.revenue}>
            ${event.ticket_sales_revenue.toFixed(2)}
          </Text>
          <Text style={styles.caption}>Gross Revenue</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales</Text>
            <View style={styles.filters}>
              {["day", "week", "month"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterBtn,
                    salesFilter === type && styles.filterActive,
                  ]}
                  onPress={() => setSalesFilter(type)}
                >
                  <Text style={styles.filterText}>
                    {type.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <LineChart
            data={{
              labels: getLabels(salesData),
              datasets: [{ data: getCounts(salesData) }],
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.pieRow}>
          <View style={[styles.halfCard, { width: "60%" }]}>
            <Text style={styles.chartTitle}>Gender</Text>
            <PieChart
              data={
                genderData.length > 0
                  ? genderData
                  : [
                      {
                        name: "No Data",
                        population: 1,
                        color: "#555",
                        legendFontColor: "#aaa",
                        legendFontSize: 12,
                      },
                    ]
              }
              width={screenWidth * 0.6}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              style={{ marginTop: 10 }}
            />
          </View>

          <View style={{ width: "38%", justifyContent: "space-between" }}>
            <View
              style={[
                styles.halfCard,
                {
                  width: "100%",
                  height: 100,
                  marginBottom: 10,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={styles.boxValue}>
                {event.seat_num - event.seats_left}
              </Text>
              <Text style={styles.boxCaption}>Tickets sold</Text>
            </View>

            <View
              style={[
                styles.halfCard,
                {
                  width: "100%",
                  height: 100,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={styles.boxValue}>{totalViews}</Text>
              <Text style={styles.boxCaption}>Views total</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Views</Text>
            <View style={styles.filters}>
              {["day", "week", "month"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterBtn,
                    viewFilter === type && styles.filterActive,
                  ]}
                  onPress={() => setViewFilter(type)}
                >
                  <Text style={styles.filterText}>
                    {type.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <LineChart
            data={{
              labels: getLabels(viewData),
              datasets: [{ data: getCounts(viewData) }],
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Most popular cities</Text>
          <BarChart
            data={
              cityData.labels?.length
                ? cityData
                : { labels: [""], datasets: [{ data: [0] }] }
            }
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Customer Ages</Text>
          <BarChart
            data={
              ageData.labels?.length
                ? ageData
                : { labels: [""], datasets: [{ data: [0] }] }
            }
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </View>

        <TouchableOpacity
          style={styles.finishBtn}
          onPress={async () => {
            try {
              await axios.patch(`${serverIP}/eventRoute/${event._id}/status`);

              await axios.delete(
                `${serverIP}/deleteTicketsByEvent/${event._id}`
              );

              Alert.alert(
                "Finished",
                "Event marked as finished and tickets deleted."
              );
              navigation.goBack();
            } catch (error) {
              console.error("Error finishing event:", error);
              Alert.alert("Error", "Failed to finish event or delete tickets");
            }
          }}
        >
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#111",
  backgroundGradientTo: "#111",
  decimalPlaces: 0,
  color: () => "#CAFD00",
  labelColor: () => "#fff",
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  container: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#111",
    zIndex: 100,
    elevation: 4,
  },
  pageTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 5,
  },
  editButton: {
    padding: 5,
  },
  revenue: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  caption: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#1E1C21",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: "#1E1C21",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    backgroundColor: "#333",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterActive: {
    backgroundColor: "#CAFD00",
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  chart: {
    marginTop: 10,
    borderRadius: 8,
  },
  pieRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfCard: {
    width: "48%",
    backgroundColor: "#1E1C21",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
  },
  boxValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  boxCaption: {
    color: "#aaa",
    fontSize: 10,
  },
  finishBtn: {
    backgroundColor: "red",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 20,
  },
  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EventViewsScreen;
