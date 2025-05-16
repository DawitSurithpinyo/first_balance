import { RecordItem } from '@/interface';
import { useRecordContext } from '@/lib/recordContext';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { DatePickerModal } from "react-native-paper-dates";
import Animated from 'react-native-reanimated';
import { Row, Table } from 'react-native-table-component';

export default function HomeScreen() {
  const {height, width: screenWidth} = useWindowDimensions();
  const {records: listOfRecords, setRecords: setListOfRecords, fetchRecords} = useRecordContext();
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  // use useFocusEffect on individual pages instead of in recordContext.tsx
  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  const defaultData = useMemo(() => (
    listOfRecords.map((record: RecordItem) => [
        record.TransactionName,
        record.AccountID,
        record.Value,
        record.Date,
        record.Memo
      ])
  ), [listOfRecords]);

  const [filteredData, setFilteredData] = useState(defaultData);

  useEffect(() => {
    setFilteredData(defaultData);
  }, [defaultData]);


  // const SMALL_SCREEN = 800
  // var mainContainerStyle;
  // if(width > SMALL_SCREEN){
  //   mainContainerStyle = styles.mainContainerNormalScreen
  // }

  const tableData = {
    header: ['Transaction name', 'Account ID', 'Value', 'Date', 'Memo'],
    data: filteredData,
    widthArr: [0.25*screenWidth, 0.2*screenWidth, 0.15*screenWidth, 0.1*screenWidth, 0.25*screenWidth]
  };

  const onDatePicker1Confirm = (params: {date: Date | undefined}) => {
    setShowDatePicker1(false);
    if (params.date) {
      // Normalize to start of day (the DatePickerModal gives date with hours and finer details too, 
      // which can unintentionally leaves out a transaction if selected date is same as date of that transaction)
      // to make sure, set it to first millisecond of the day, so it will be "before in time" comparing to 
      // any transactions with the same date
      const normalizedDate = new Date(params.date);
      normalizedDate.setHours(0, 0, 0, 0); // first millisecond of the day
      setFilters({ ...filters, startDate: normalizedDate });
    } else {
      setFilters({ ...filters, startDate: undefined });
    }
  };

  const onDatePicker2Confirm = (params: {date: Date | undefined}) => {
    setShowDatePicker2(false);
    if (params.date) {
      // Normalize to end of day
      const normalizedDate = new Date(params.date);
      normalizedDate.setHours(23, 59, 59, 999); // last millisecond of the day
      setFilters({ ...filters, endDate: normalizedDate });
    } else {
      setFilters({ ...filters, endDate: undefined });
    }
  };

  const [filters, setFilters] = useState({
    transactionName: '',
    accountID: '',
    minValue: Number.MIN_SAFE_INTEGER,
    maxValue: Number.MAX_SAFE_INTEGER,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    memo: ''
  });

  const [invalidMsg, setInvalidMsg] = useState('')

  const handleFilterSubmit = () => {
    var localInvalidMsg = ''
    var isValid = true
    // since onChangeText={... Number(text)}, if input is a text, it will become NaN anyway
    // which will not get pass here
    if(isNaN(filters.minValue) || isNaN(filters.maxValue)){
      isValid = false
      localInvalidMsg = 'Please enter a numerical input for min/max value'
    }
    else if(filters.minValue > filters.maxValue){
      isValid = false
      localInvalidMsg = 'Min value cannot be more than max value'
    }
    else if(filters.startDate && filters.endDate){
      if(filters.startDate > filters.endDate){
        isValid = false
        localInvalidMsg = 'start date cannot be after the end date'
      }
    }

    setInvalidMsg(localInvalidMsg)

    // cannot submit if above conditions are violated
    if(!isValid){
      return
    }

    const regexTransactionName = new RegExp(filters.transactionName.toLowerCase())
    const regexAccountID = new RegExp(filters.accountID.toLowerCase())
    const regexMemo = new RegExp(filters.memo.toLowerCase())

    // const safeStartDate = filters.startDate ?? new Date(0); // if undefined, fall back to Jan 1, 1970
    // const safeEndDate = filters.endDate ?? new Date(); // fall back to today
    // this is fine because if date is somehow undefined, it means user want to include any date anyway

    let temp: any[][] = [];
    for(let i = 0; i < defaultData.length; i++){
      let validCount = 0;

      if(regexTransactionName.test(defaultData[i][0].toLowerCase())){
        validCount += 1
      }
      if(regexAccountID.test(defaultData[i][1].toLowerCase())){
        validCount += 1
      }
      // Since memo is optional, it can be undefined, which throws error if try to use .toLowerCase() on it
      // just let it be an empty string I guess?
      if(defaultData[i][4] === undefined){
        defaultData[i][4] = ''
      }
      if(regexMemo.test(defaultData[i][4].toLowerCase())){
        validCount += 1
      }

      if(defaultData[i][2] >= filters.minValue && defaultData[i][2] <= filters.maxValue){
        validCount += 1
      }

      const [day, month, year] = (defaultData[i][3] as string).split('-').map(Number);
      const recordDate = new Date(year, month - 1, day);
      let dateValid = true;
      if (filters.startDate) {
        dateValid = dateValid && recordDate >= filters.startDate;
      }
      if (filters.endDate) {
        dateValid = dateValid && recordDate <= filters.endDate;
      }
      // if both date aren't specified, automatically, it just let whatever dates pass
      // this is genius thank you Deepseek
      if (dateValid) {
        validCount += 1;
      }

      if(validCount === 5){
        temp.push(defaultData[i])
      }
    }

    setFilteredData(temp)
    setShowSidebar(false)

  }

  return (
  <Animated.ScrollView>
    <View style={styles.mainContainerNormalScreen}>

      {/* filters */}
      <View style={[styles.filtersContainer,{display:showSidebar?'flex':'none'}]}>

        {/* filters window close button */}
        <TouchableOpacity style={styles.filtersCloseButton} onPress={() => setShowSidebar(false)}>
          <Text style={{fontWeight: 'bold', fontSize: 20, color: 'white'}}>X</Text>
        </TouchableOpacity>

        <Text style={screenWidth>=576?styles.filtersTitleText:styles.PhonefiltersTitleText}>Filter transactions by fields</Text>
        <Text style={styles.filtersSubtitleText}>If no value is given to a field, it will include any value possible for that field. Text searches are case-insensitive.</Text>
        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Transaction name</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.transactionName}
          onChangeText={(text) => setFilters({ ...filters, transactionName: text })}
          style={screenWidth>=576?styles.textinputbox:styles.Phonetextinputbox}
        />

        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Account ID</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.accountID}
          onChangeText={(text) => setFilters({ ...filters, accountID: text })}
          style={screenWidth>=576?styles.textinputbox:styles.Phonetextinputbox}
        />

        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Minimum value (inclusive)</Text>
        <TextInput
          keyboardType='numeric'
          placeholder='Enter a number'
          onChangeText={(text) => {
            if (text.trim() === '') {
              // make sure to fall back to default (Number.MIN_SAFE_INTEGER) again when user input minValue before,
              // but doesn't input (left it blank) now
              setFilters({ ...filters, minValue: Number.MIN_SAFE_INTEGER });
            } else {
              // if user input a text, let it become NaN.
              // it'll be handled in handleFilterSubmit anyway
              const num = Number(text);
              setFilters({ ...filters, minValue: num });
            }
          }}
          style={screenWidth>=576?styles.textinputbox:styles.Phonetextinputbox}
        />
        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Maximum value (inclusive)</Text>
        <TextInput
          keyboardType='numeric'
          placeholder='Enter a number'
          onChangeText={(text) => {
            if (text.trim() === '') {
              setFilters({ ...filters, maxValue: Number.MAX_SAFE_INTEGER });
            } else {
              const num = Number(text);
              setFilters({ ...filters, maxValue: num });
            }
          }}
          style={screenWidth>=576?styles.textinputbox:styles.Phonetextinputbox}
        />

        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Start date (inclusive)</Text>
        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>You picked: {filters.startDate? filters.startDate.toDateString(): "None"}</Text>
        <Button title="Select start date"
          color='#F48FB1'
          onPress={()=>{setShowDatePicker1(true)}}/>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker1}
          onDismiss={() => setShowDatePicker1(false)}
          date={filters.startDate ?? new Date()}
          placeholder='Starting date'
          onConfirm={onDatePicker1Confirm}
        />
        <Button title="reset to none"
          color="#E91E63"
          onPress={() => {
              setFilters({ ...filters, startDate: undefined});
              setShowDatePicker1(false);
            }
          }
        />

        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>End date (inclusive)</Text>
        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>You picked: {filters.endDate? filters.endDate.toDateString(): "None"}</Text>
        <Button title="Select end date"
          color='#F48FB1'
          onPress={()=>{setShowDatePicker2(true)}}/>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker2}
          onDismiss={() => setShowDatePicker2(false)}
          date={filters.endDate ?? new Date()}
          placeholder='Ending date'
          onConfirm={onDatePicker2Confirm}
        />
        <Button title="reset to none"
          color="#E91E63"
          onPress={() => {
              setFilters({ ...filters, endDate: undefined});
              setShowDatePicker2(false);
            }
          }
        />

        <Text style={screenWidth>=576?styles.filtersFieldsText:styles.PhonefiltersFieldsText}>Memo</Text>
        <TextInput
          placeholder='Enter a substring to search for'
          autoCorrect={false}
          value={filters.memo}
          onChangeText={(text) => setFilters({ ...filters, memo: text })}
          style={screenWidth>=576?styles.textinputbox:styles.Phonetextinputbox}
        />

        <View style={{padding: 10}}>
        <Text style={styles.invalidMsgStyle}>{invalidMsg}</Text>
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
            <View style={{padding: 10}}>
              <Button title="modify filter"
                color='darkorchid'
                onPress={() => {handleFilterSubmit(),setShowSidebar(true)}}
                />
            </View>
            <Table>
              <Row data={tableData.header} widthArr={tableData.widthArr} style={styles.recordTableHeader} textStyle={screenWidth>=576?styles.recordTableHeaderText:styles.phoneRecordTableHeaderText}/>
            </Table>
            <ScrollView style={styles.recordTableDataWrapper}>
              <Table>
                {filteredData.map((rowData: [], index: React.Key) => (
                  <Row
                    key={index}
                    data={rowData}
                    widthArr={tableData.widthArr}
                    style={styles.recordTableDataCells}
                    textStyle={screenWidth>=576?styles.recordTableText:styles.phoneRecordTableText}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainerNormalScreen: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes children apart
    alignItems: 'flex-start', // Align items to the top
    padding: 20,
    width: '300%',
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
    fontSize:20
  },

  phoneRecordTableHeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize:10
  },

  recordTableText: {
    textAlign: 'center',
    fontWeight: '300',
    fontSize: 20
  },

  phoneRecordTableText: {
    textAlign: 'center',
    fontWeight: '300',
    fontSize: 10
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
    margin: -20,
    display : 'flex'
  },

  filtersCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'red',
    padding: 5
  },

  filtersTitleText: {
    fontWeight: 'bold',
    fontSize: 22
  },

  PhonefiltersTitleText: {
    fontWeight: 'bold',
    fontSize: 15
  },

  filtersSubtitleText: {
    fontWeight: 'bold',
    fontSize: 15
  },

  filtersFieldsText: {
    marginTop: 15,
    fontWeight: '400',
    fontSize: 17
  },

  invalidMsgStyle: {
    color: 'red',
    fontWeight: '600'
  },
  PhonefiltersFieldsText: {
    marginTop: 15,
    fontWeight: '400',
    fontSize: 10
  },

  textinputbox: {
    fontSize : 20
  },

  Phonetextinputbox: {
    fontSize : 8
  }

});
