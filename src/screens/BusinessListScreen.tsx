import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

type Props = StackScreenProps<RootStackParamList, "BusinessList">;

const BusinessListScreen: React.FC<Props> = ({ route }) => {
  const { jsonData } = route.params; // JSON data passed as a parameter
  const businesses = JSON.parse(jsonData); // Convert JSON data into a JavaScript object

  // If no NACE codes are found, return an error message
  if (!businesses || businesses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No suppliers found.</Text>
      </View>
    );
  }

  // Flatten the list of suppliers from all businesses
  const suppliers = businesses.reduce((acc: any[], business: any) => {
    return [...acc, ...business.Suppliers];
  }, []);

  const renderSupplier = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.SupplierName}</Text>
      <Text style={styles.text}>ID: {item.SupplierID}</Text>
      <Text style={styles.text}>Address: {item.Address}</Text>
      <Text style={styles.text}>City: {item.City}</Text>
      <Text style={styles.text}>Region: {item.Region}</Text>
      <Text style={styles.text}>Phone: {item.PhoneNumber}</Text>
      <Text style={styles.text}>Contact: {item.ContactPerson}</Text>
    </View>
  );

  return (
    <FlatList
      data={suppliers} // List of all suppliers
      renderItem={renderSupplier} // Render function for each supplier
      keyExtractor={(item) => item.SupplierID} // Unique key for each item
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
});

export default BusinessListScreen;
