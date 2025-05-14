import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { DatePickerModal } from "react-native-paper-dates";
import { Row, Table } from 'react-native-table-component';

import { RecordItem } from '@/interface';
import { useRecordContext } from '@/lib/recordContext';
import { TextInput } from 'react-native-paper';

export default function HomeScreen() {
  const {width: screenWidth} = useWindowDimensions();
  const {records: listOfRecords, setRecords: setListOfRecords} = useRecordContext();
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);

  const tableData = {
    header: ['Transaction name', 'Account ID', 'Value', 'Date', 'Memo'],
    data: [] as any[][], // need to define data array as 2D array with multiple types (any)
    widthArr: [0.15*screenWidth, 0.1*screenWidth, 0.1*screenWidth, 0.1*screenWidth, 0.15*screenWidth]
  };

  listOfRecords.map((record: RecordItem) => {
    tableData.data.push([
      record.TransactionName, 
      record.AccountID,
      record.Value,
      record.Date,
      record.Memo
    ])
  })

  const [startFilterDate, setStartFilterDate] = useState<Date | undefined>(undefined);
  const [endFilterDate, setEndFilterDate] = useState<Date | undefined>(undefined);

  const onDatePicker1Confirm = (params: {date:Date|undefined}) => {
    setShowDatePicker1(false);
    setStartFilterDate(params.date);
  }
  const onDatePicker2Confirm = (params: {date:Date|undefined}) => {
    setShowDatePicker2(false);
    setEndFilterDate(params.date);
  }

  const [filters, setFilters] = useState({
    transactionName: '',
    accountID: '',
    minValue: '',
    maxValue: '',
    startDate: '',
    endDate: '',
    memo: ''
  });

  const handleFilterSubmit = () => {
    //...
  }

  return (
  <View>
    <View style={styles.mainContainer}>

      {/* filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitleText}>Filter transactions by fields</Text>
        <Text style={styles.filtersFieldsText}>Transaction name</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.transactionName}
          onChangeText={(text) => setFilters({ ...filters, transactionName: text })}
        />

        <Text style={styles.filtersFieldsText}>Account ID</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.accountID}
          onChangeText={(text) => setFilters({ ...filters, accountID: text })}
        />

        <Text style={styles.filtersFieldsText}>Minimum value</Text>
        <TextInput
          placeholder='Enter a number'
          value={filters.minValue}
          onChangeText={(text) => setFilters({ ...filters, minValue: text })} // convert to number later
        />
        <Text style={styles.filtersFieldsText}>Maximum value</Text>
        <TextInput
          placeholder='Enter a number'
          value={filters.maxValue}
          onChangeText={(text) => setFilters({ ...filters, maxValue: text })} // convert to number later
        />

        <Text style={styles.filtersFieldsText}>Start date</Text>
        <Button title="Select start date"
          color='#F48FB1'
          onPress={()=>{setShowDatePicker1(true)}}/>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker1}
          onDismiss={() => setShowDatePicker1(false)}
          date={startFilterDate}
          placeholder='Starting date'
          onConfirm={onDatePicker1Confirm}
        />
        <Text style={styles.filtersFieldsText}>End date</Text>
        <Button title="Select end date"
          color='#F48FB1'
          onPress={()=>{setShowDatePicker2(true)}}/>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker2}
          onDismiss={() => setShowDatePicker2(false)}
          date={endFilterDate}
          placeholder='Ending date'
          onConfirm={onDatePicker2Confirm}
        />

        <Text style={styles.filtersFieldsText}>Memo</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.memo}
          onChangeText={(text) => setFilters({ ...filters, memo: text })}
        />

        <View style={{padding: 10}}>
        <Button title="Confirm filter"
          color='darkorchid'
          onPress={() => {handleFilterSubmit()}}
        />
        </View>
      </View>

      {/* transactions table */}
      <View style={styles.recordTableContainer}>
        <ScrollView horizontal={true}>
          <View>
            <Table>
              <Row data={tableData.header} widthArr={tableData.widthArr} style={styles.recordTableHeader} textStyle={styles.recordTableHeaderText}/>
            </Table>
            <ScrollView style={styles.recordTableDataWrapper}>
              <Table>
                {tableData.data.map((rowData, index) => (
                  <Row
                    key={index} // Add a unique key
                    data={rowData}
                    widthArr={tableData.widthArr}
                    style={styles.recordTableDataCells}
                    textStyle={styles.recordTableText}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      </View>
    </View>
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({
    //           ios: 'cmd + d',
    //           android: 'cmd + m',
    //           web: 'F12',
    //         })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //     <ThemedText>
    //       {`Tap the Explore tab to learn more about what's included in this starter app.`}
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       {`When you're ready, run `}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>

    // <View>
    //   <ScrollView>
    //     <DataTable style={styles.tableContainer}>
    //       <DataTable.Header style={styles.tableHeader}>
    //         <DataTable.Title textStyle={styles.headerCellText}>Transaction Name</DataTable.Title>
    //         <DataTable.Title textStyle={styles.headerCellText}>Account ID</DataTable.Title>
    //         <DataTable.Title textStyle={styles.headerCellText} numeric>Value</DataTable.Title>
    //         <DataTable.Title textStyle={styles.headerCellText}>Date</DataTable.Title>
    //         <DataTable.Title textStyle={styles.headerCellText}>Memo</DataTable.Title>
    //       </DataTable.Header>
    //     </DataTable>
    //   </ScrollView>
    // </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes children apart
    alignItems: 'flex-start', // Align items to the top
    padding: 20,
    width: '100%',
  },

  recordTableContainer: {
    flex: 1, // Takes remaining space
    overflow: 'hidden', // Ensures table respects bounds
  },

  recordTableHeader: {
    height: 60,
    backgroundColor: '#BA68C8',
    borderColor: "rgb(0, 0, 0)",
    borderWidth: 2
  },

  recordTableHeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20
  },

  recordTableText: {
    textAlign: 'center',
    fontWeight: '300',
    fontSize: 20
  },

  recordTableDataCells: {
    backgroundColor: '#E1BEE7',
    borderColor: "rgb(0, 0, 0)",
    borderWidth: 2,
    marginTop: -1
  },

  recordTableDataWrapper: {
    marginTop: -1
  },

  filtersContainer: {
    width: '30%', // Fixed width for filters
    marginRight: '7%', // Add space between filters and table
    backgroundColor: 'white',
    padding: 20,
    margin: -20
  },

  filtersTitleText: {
    fontWeight: 'bold',
    fontSize: 22
  },

  filtersFieldsText: {
    marginTop: 15,
    fontWeight: '400',
    fontSize: 17
  }
});
