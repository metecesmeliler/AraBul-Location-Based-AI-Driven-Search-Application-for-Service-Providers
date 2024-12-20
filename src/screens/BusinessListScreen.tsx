import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

interface SearchResult {
  code: string;
  description: string;
  distance?: number;
}

interface ChatResponse {
  results: SearchResult[];
  original_query: string;
}

type Props = StackScreenProps<RootStackParamList, 'BusinessList'>;

const BusinessListScreen: React.FC<Props> = ({ route, navigation }) => {
  // Parse the JSON data passed from the previous screen
  const { jsonData } = route.params;
  const parsedData: ChatResponse = JSON.parse(jsonData);

  const renderResultItem = ({ item, index }: { item: SearchResult, index: number }) => (
    <View style={styles.resultContainer}>
      <View style={styles.resultHeader}>
        <Text style={styles.codeLabel}>NACE Code</Text>
        <Text style={styles.codeText}>{item.code}</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      {item.distance !== null && item.distance !== undefined && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>Relevance Score</Text>
          <Text style={styles.distanceText}>
            {item.distance ? item.distance.toFixed(4) : 'N/A'}
          </Text>
        </View>
      )}
      {index < parsedData.results.length - 1 && <View style={styles.divider} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Search Results</Text>
        <Text style={styles.queryText}>
          Query: "{parsedData.original_query}"
        </Text>
      </View>
      
      <FlatList
        data={parsedData.results}
        renderItem={renderResultItem}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Chat</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#0084ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  queryText: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0084ff',
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  distanceText: {
    fontSize: 14,
    color: '#0084ff',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#0084ff',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BusinessListScreen;