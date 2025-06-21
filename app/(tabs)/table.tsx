import { Filters, RecordItem, RecordResponseJson } from '@/interface';
import deleteMany from '@/lib/deleteMany';
import deleteOne from '@/lib/deleteOne';
import { useRecordContext } from '@/lib/recordContext';
import updateRecord from '@/lib/updateOne';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Modal from "react-native-modal";
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
  const [updateResponse, setUpdateResponse] = useState<RecordResponseJson|undefined>(undefined)
  const [deleteOneResponse, setDeleteOneResponse] = useState<RecordResponseJson|undefined>(undefined)
  const [deleteShownResponse, setDeleteShownResponse] = useState<RecordResponseJson|undefined>(undefined)

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

  const tableData = {
    header: ['Transaction name', 'Account ID', 'Value', 'Date', 'Memo'],
    data: filteredData,
    widthArr: [0.2*screenWidth, 0.2*screenWidth, 0.15*screenWidth, 0.17*screenWidth, 0.18*screenWidth]
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
    startDate: undefined as Date | undefined | null,
    endDate: undefined as Date | undefined | null,
    memo: ''
  });

  useEffect(() => {
    // This will re-apply the current filters whenever defaultData changes
    handleFilterSubmit(); 
  }, [defaultData]); // Only run when defaultData changes

  const [invalidMsg, setInvalidMsg] = useState('')

  const handleFilterSubmit = useCallback((customFilters = filters) => {
    var localInvalidMsg = ''
    var isValid = true
    // since onChangeText={... Number(text)}, if input is a text, it will become NaN anyway
    // which will not get pass here
    if(isNaN(customFilters.minValue) || isNaN(customFilters.maxValue)){
      isValid = false
      localInvalidMsg = 'Please enter a numerical input for min/max value'
    }
    else if(customFilters.minValue > customFilters.maxValue){
      isValid = false
      localInvalidMsg = 'Min value cannot be more than max value'
    }
    else if(customFilters.startDate && customFilters.endDate){
      if(customFilters.startDate > customFilters.endDate){
        isValid = false
        localInvalidMsg = 'start date cannot be after the end date'
      }
    }

    setInvalidMsg(localInvalidMsg)

    // cannot submit if above conditions are violated
    if(!isValid){
      return
    }

    // if there is no data, we probably should not do anything. It can invoke errors and things
    if(!defaultData || defaultData.length == 0){
      return
    }

    const regexTransactionName = new RegExp(customFilters.transactionName.toLowerCase())
    const regexAccountID = new RegExp(customFilters.accountID.toLowerCase())
    const regexMemo = new RegExp(customFilters.memo.toLowerCase())

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
      // just let it be an empty string before checking I guess?
      if(defaultData[i][4] === undefined){
        defaultData[i][4] = ''
      }
      if(regexMemo.test(defaultData[i][4].toLowerCase())){
        validCount += 1
      }

      if(defaultData[i][2] >= customFilters.minValue && defaultData[i][2] <= customFilters.maxValue){
        validCount += 1
      }

      const [day, month, year] = (defaultData[i][3] as string).split('-').map(Number);
      const recordDate = new Date(year, month - 1, day); // Months are 0-indexed in JS
      let dateValid = true;
      if (customFilters.startDate) {
        dateValid = dateValid && recordDate >= customFilters.startDate;
      }
      if (customFilters.endDate) {
        dateValid = dateValid && recordDate <= customFilters.endDate;
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
  }, [filters, defaultData]);


  // ['Transaction name', 'Account ID', 'Value', 'Date', 'Memo']
  const [selectedRecord, setSelectedRecord] = useState<any[] | null>(null);
  const [originalRecord, setOriginalRecord] = useState<RecordItem | null>(null); // New state for original values
  const handleRowPress = (index: number) => {
    // As soon as edit form is opened, save original state of the transaction
    // for use in updating in backend
    const record = filteredData[index];
    setSelectedRecord([...record]); // Create a copy for editing
    setOriginalRecord({ // Store original values
      TransactionName: record[0],
      AccountID: record[1],
      Value: record[2],
      Date: record[3],
      Memo: record[4]
    });
    setIsModalVisible(true);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
    setOriginalRecord(null); // Clear original values when closing
  };

  const getParsedDate = (date: string) => {
      const [day, month, year] = date.split('-');
      return new Date(`${year}-${month}-${day}`);
  };
  const [showDatePickerEdit, setShowDatePickerEdit] = useState(false);
  const onDatePickerEditConfirm = (params: {date: Date | undefined}) => {
    setShowDatePickerEdit(false);
    if (params.date && selectedRecord) {
      // Convert Date back to string "DD-MM-YYYY" format
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formattedDate = formatDate(params.date);
      const updatedRecord = [...selectedRecord];
      updatedRecord[3] = formattedDate;
      setSelectedRecord(updatedRecord);
    }
  };

  const [EditInvalidMsg, setEditInvalidMsg] = useState('')
  const handleEditSubmit = async () => {
    // Most likely cannot happen, as all transactions must have required fields
    // and at most user will just submit unchanged transaction, which results in nothing
    // or user leave all fields empty, which will be handled below anyway.
    // Just have this to prevent TypeScript error
    if (!selectedRecord || !originalRecord) {
      return;
    }

    const wasChanged = selectedRecord[0] !== originalRecord.TransactionName || selectedRecord[1] !== originalRecord.AccountID ||
                      selectedRecord[2] !== originalRecord.Value || selectedRecord[3] !== originalRecord.Date || selectedRecord[4] !== originalRecord.Memo

    if(!wasChanged){
      // if nothing changed, perform no update and close the edit form
      handleModalClose();
      return;
    }
    
    let isValid = true
    const today = new Date()
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    let localInvalidMsg = ''

    let [newTransactionName, newAccountID, newValue, newDate, newMemo] = selectedRecord as [
      string, 
      string, 
      number|string|undefined, 
      string, 
      string|undefined
    ];

    newValue = Number(newValue)

    if(newAccountID.trim()===''){
      localInvalidMsg = 'please enter a new account ID'
      isValid = false
    }
    else if(newTransactionName.trim()===''){
      localInvalidMsg = 'please enter a new transaction name'
      isValid = false
    }
    else if(isNaN(newValue)){
      localInvalidMsg = 'please enter a numeric amount of transaction value'
      isValid = false
    }
    else if(newValue === 0){
      localInvalidMsg = 'please enter a non-zero amount of transaction value'
      isValid = false
    }

    const [day, month, year] = newDate.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day); // Months are 0-indexed in JS

    if (inputDate > today) {
      localInvalidMsg = 'Please select a date no later than today';
      isValid = false;
    }
    if(!newMemo){
      newMemo = ''
    }

    setEditInvalidMsg(localInvalidMsg);

    if(!isValid){
      return;
    }

    try {
      // Find index in original listOfRecords
      const originalIndex = listOfRecords.findIndex((record: RecordItem) => 
        record.TransactionName === originalRecord.TransactionName &&
        record.AccountID === originalRecord.AccountID &&
        record.Value === originalRecord.Value &&
        record.Date === originalRecord.Date &&
        record.Memo === originalRecord.Memo
      );

      // Optimistically update listOfRecords
      if (originalIndex > -1) {
        const updatedRecords = [...listOfRecords];
        updatedRecords[originalIndex] = {
          ...updatedRecords[originalIndex],
          TransactionName: newTransactionName,
          AccountID: newAccountID,
          Value: newValue,
          Date: newDate,
          Memo: newMemo
        };
        setListOfRecords(updatedRecords);
      }

      // Update backend
      const newRecord = {
        TransactionName: newTransactionName,
        AccountID: newAccountID,
        Value: newValue,
        Date: newDate,
        Memo: newMemo
      };

      await updateRecord({
        originalRec: originalRecord,
        newRec: newRecord,
        setResponse: setUpdateResponse
      });

      // Removed the fetchRecords to avoid fetching outdated data

    } catch (error) {
      // Revert to original data on error
      setListOfRecords([...listOfRecords]);
      setFilteredData(defaultData);
    }

    handleModalClose();
  }

  const [deleteOneWarningIsVisible, setDeleteOneWarningIsVisible] = useState(false)
  const deleteARecord = async () => {
    // delete and optimistic updating
    if (!selectedRecord || !originalRecord) {
      return;
    }

    try {
      // Find index in original listOfRecords
      const originalIndex = listOfRecords.findIndex((record: RecordItem) => 
        record.TransactionName === originalRecord.TransactionName &&
        record.AccountID === originalRecord.AccountID &&
        record.Value === originalRecord.Value &&
        record.Date === originalRecord.Date &&
        record.Memo === originalRecord.Memo
      );

      // Optimistically update listOfRecords
      if (originalIndex > -1) {
        const updatedRecords = [...listOfRecords];
        updatedRecords.splice(originalIndex, 1)
        setListOfRecords(updatedRecords);
      }

      // Update backend
      deleteOne({
        recItem: originalRecord,
        setResponse: setDeleteOneResponse
      })

      // Removed the fetchRecords to avoid fetching outdated data

    } catch (error) {
      // Revert to original data on error
      setListOfRecords([...listOfRecords]);
      setFilteredData(defaultData);
    }

    setDeleteOneWarningIsVisible(false);
    handleModalClose();
  }

  const resetFilters = () => {
    const newFilter = {
      transactionName: '',
      accountID: '',
      minValue: Number.MIN_SAFE_INTEGER,
      maxValue: Number.MAX_SAFE_INTEGER,
      startDate: undefined as Date | undefined | null,
      endDate: undefined as Date | undefined | null,
      memo: ''
    }
    setFilters(newFilter)
    handleFilterSubmit(newFilter)
    //fetchRecords()
  }

  const [deleteShownWarningIsVisible, setDeleteShownWarningIsVisible] = useState(false)
  const deleteShownTransactions = async () => {
    // delete, optimistic updating, and reset filters to default values (include anything)
    try {
      if(!filteredData || filteredData.length === 0){
        // If no data at all, or current filters have no matching data,
        // just reset filters, close the warning modal, and don't do anything
        resetFilters();
        setDeleteShownWarningIsVisible(false);
        return;
      }

      // perform deletion ...
      // send filters to backend:
        // if minValue is Number.MIN_SAFE_INTEGER or maxValue is Number.MAX_SAFE_INTEGER
        // replace with Number.NaN, so that the JSON.stringify method for body in fetching method
        // in deleteMany.tsx will replace it with null.
        // Then, in Flask (null converted to Python None), set filter query to be only either $lte or $gte, for example:
        // if minValue is None: { Value: { $lte: maxValue } }
        // if both min and max are chosen by user: { Value: { $gte: 10, $lte: 20 } }

        // Text fields are easy and can be handled in Flask backend entirely.

        // dates as string "DD-MM-YYYY" is ok, but for both frontend Filters and existing documents in MongoDB,
        // need to convert their dates to "YYYY-MM-DD" first, so MongoDB can compare lexically.
        // **** Don't forget to convert date of remaining documents in MongoDB
        // back to "DD-MM-YYYY" too.
        // undefined date filters -> user don't care about date filters
        // But as a property value in an object like { 'startDate': undefined }), JSON stringify
        // will omit the property entirely (becomes {})
        // so need to change undefined to null, which becomes to None in Python
      let tempFilter = {...filters}
      if(tempFilter.minValue === Number.MIN_SAFE_INTEGER){
        tempFilter.minValue = Number.NaN  
      }
      if(tempFilter.maxValue === Number.MAX_SAFE_INTEGER){
        tempFilter.maxValue = Number.NaN
      }
      if(tempFilter.startDate === undefined){
        tempFilter.startDate = null
      }
      if(tempFilter.endDate === undefined){
        tempFilter.endDate = null
      }

      // try optimistic deletion
      // first get indices to delete
      let tempFilteredData = [...filteredData]
      let indicesArray = [] as number[]
      for(let i = 0; i < tempFilteredData.length; i++){
        let index = listOfRecords.findIndex((r: RecordItem) => 
          r.TransactionName === tempFilteredData[i][0] &&
          r.AccountID === tempFilteredData[i][1] &&
          r.Value === tempFilteredData[i][2] &&
          r.Date === tempFilteredData[i][3] &&
          r.Memo === tempFilteredData[i][4]
        )
        // ^^ DO NOT use block-bodied arrow function i.e., .findIndex( => {let index...} )
        // without putting return statement at the end.
        // I didn't have a return statement, so it always returned undefined, so no indices, and optimistic deletion didn't work
        // Either { => return(...)} or explicit return like above ( .findIndex( => ) )
        if(index !== -1){
          indicesArray.push(index)
        }
      }

      // Create new array WITHOUT deleted items
      const newRecords = listOfRecords.filter((_:any, index:number) => !indicesArray.includes(index))

      // Update state
      setListOfRecords(newRecords);
      setFilteredData(newRecords.map((record: RecordItem) => [
        record.TransactionName,
        record.AccountID,
        record.Value,
        record.Date,
        record.Memo
      ]));

      // backend update
      let returnFilter = {} as Filters
      returnFilter = {
        TransactionNameFilter: tempFilter.transactionName,
        AccountIDFilter: tempFilter.accountID,
        MinValue: tempFilter.minValue,
        MaxValue: tempFilter.maxValue,
        StartDate: tempFilter.startDate,
        EndDate: tempFilter.endDate,
        MemoFilter: tempFilter.memo
      }
      deleteMany({
        condition: returnFilter,
        setResponse: setDeleteShownResponse
      })
    }
    catch(error){
      // fall back to default data if failed
      setListOfRecords([...listOfRecords]);
      setFilteredData(defaultData);      
    }
    resetFilters();
    setDeleteShownWarningIsVisible(false);
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
          defaultValue={filters.minValue === Number.MIN_SAFE_INTEGER ? '' : filters.minValue.toString()}
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
          defaultValue={filters.maxValue === Number.MAX_SAFE_INTEGER ? '' : filters.maxValue.toString()}
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
              setFilters(prev => ({...prev, startDate: undefined}));
              // handleFilterSubmit({...filters, startDate: undefined});
            }}
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
            setFilters(prev => ({...prev, endDate: undefined}));
            // handleFilterSubmit({...filters, endDate: undefined});
          }}
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
          onPress={() => {handleFilterSubmit(filters)}}
        />
        </View>
      </View>

      <View>
      {/* Header Text Section - Will appear on top */}
      {/* <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Transactions list</Text>
        <Text style={styles.headerDescription}>
          Click on a row of data to edit or delete that transaction.{"\n"}
          You can also filter your transactions by clicking the "modify filter" button below the table.
        </Text>
      </View> */}
      {/* transactions table */}
      <View style={styles.recordTableContainer}>
        <ScrollView horizontal={true}>
          <View>
            <Table>
              <Row data={tableData.header} widthArr={tableData.widthArr} style={styles.recordTableHeader} textStyle={screenWidth>=576?styles.recordTableHeaderText:styles.phoneRecordTableHeaderText}/>
            </Table>
            <ScrollView style={styles.recordTableDataWrapper}>
              <Table>
                {filteredData.map((rowData: [], index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handleRowPress(index)}
                    style={{ position: 'relative' }}
                  >
                    <Row
                      data={rowData}
                      widthArr={tableData.widthArr}
                      style={styles.recordTableDataCells}
                      textStyle={screenWidth>=576?styles.recordTableText:styles.phoneRecordTableText}
                    />
                  </TouchableOpacity>
                ))}
              </Table>
            </ScrollView>
            <View style={{padding: 10, marginTop: 50}}>
              <Button title="modify filters"
                color='darkorchid'
                onPress={() => {setShowSidebar(true)}}
                />
            </View>
            <View style={{padding: 10}}>
              <Button title="reset filters"
                color='orchid'
                onPress={resetFilters}
                />
            </View>
            <View style={{padding: 10, marginTop: 20}}>
              <Button title="delete all currently shown transactions"
                color='red'
                onPress={() => {setDeleteShownWarningIsVisible(true)}}
                />
              {/* <Text>{(deleteShownResponse != undefined)? deleteShownResponse.message:''}</Text> */}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Single Edit Modal */}
      <Modal isVisible={isModalVisible} style={styles.editFormContainer}>
        <Animated.ScrollView>
          {selectedRecord && (
            <View style={styles.editFormContainer}>
              <View style={styles.modalHeaderRow}>

                <TouchableOpacity 
                  style={styles.editFormDeleteButton} 
                  onPress={() => setDeleteOneWarningIsVisible(true)}
                >
                  <Text style={screenWidth >= 576 ? styles.deleteButtonText: styles.phoneDeleteButtonText}>Delete this transaction</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>


              <Text style={styles.editFormTitle}>Edit transaction</Text>

                <Text style={styles.editFormFieldsText}>New transaction Name</Text>
                <TextInput
                  placeholder={selectedRecord[0]}
                  autoCorrect={false}
                  value={selectedRecord[0]}
                  onChangeText={(text) => {
                    if (selectedRecord) {
                      // Create a new array with updated value
                      const updatedRecord = [...selectedRecord];
                      updatedRecord[0] = text;
                      setSelectedRecord(updatedRecord);
                    }
                  }}
                  style={screenWidth>=576?styles.editFormTextInputBox:styles.phoneEditFormTextInputBox}
                />

                <Text style={styles.editFormFieldsText}>New account ID</Text>
                <TextInput
                  placeholder={selectedRecord[1]}
                  autoCorrect={false}
                  value={selectedRecord[1]}
                  onChangeText={(text) => {
                    if (selectedRecord) {
                      // Create a new array with updated value
                      const updatedRecord = [...selectedRecord];
                      updatedRecord[1] = text;
                      setSelectedRecord(updatedRecord);
                    }
                  }}
                  style={screenWidth>=576?styles.editFormTextInputBox:styles.phoneEditFormTextInputBox}
                />   

                <Text style={styles.editFormFieldsText}>New value (any non-zero number)</Text>
                <TextInput
                  placeholder={selectedRecord[2].toString()}
                  autoCorrect={false}
                  value={selectedRecord[2].toString()}
                  onChangeText={(text) => {
                    if(selectedRecord){
                      const updatedRecord = [...selectedRecord];
                      updatedRecord[2] = text;
                      setSelectedRecord(updatedRecord);
                      // handle NaN and stuffs when submit button is clicked
                    }
                  }}
                  style={screenWidth>=576?styles.editFormTextInputBox:styles.phoneEditFormTextInputBox}
                />

                <Text style={styles.editFormFieldsText}>New date</Text>
                <Button title="Select new date"
                  color='#F48FB1'
                  onPress={() => setShowDatePickerEdit(true)}/>
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={showDatePickerEdit}
                  onDismiss={() => setShowDatePickerEdit(false)}
                  date={getParsedDate(selectedRecord[3])}
                  placeholder='Original date'
                  onConfirm={onDatePickerEditConfirm}
                />
                <View style={{marginBottom: 20}}></View>

                <Text style={styles.editFormFieldsText}>New memo</Text>
                <TextInput
                  placeholder={selectedRecord[4]}
                  autoCorrect={false}
                  value={selectedRecord[4]}
                  onChangeText={(text) => {
                    if (selectedRecord) {
                      // Create a new array with updated value
                      const updatedRecord = [...selectedRecord];
                      updatedRecord[4] = text;
                      setSelectedRecord(updatedRecord);
                    }
                  }}
                  style={screenWidth>=576?styles.editFormTextInputBox:styles.phoneEditFormTextInputBox}
                />

              <Text style={screenWidth>=576?styles.editFormInvalidMsg:styles.phoneEditFormInvalidMsg}>{EditInvalidMsg}</Text>
              <Button title="Confirm edit" color='#BA68C8' onPress={() => {handleEditSubmit()}} />
            </View>
          )}
        </Animated.ScrollView>
      </Modal>

      {/* Delete a specific transaction warning modal */}
      <Modal 
        isVisible={deleteOneWarningIsVisible} 
        style={styles.deleteOneWarningModal}
        onBackdropPress={() => setDeleteOneWarningIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.deleteOneWarningModalCloseButton}
          onPress={() => setDeleteOneWarningIsVisible(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteOneWarningModalCloseButtonX}>X</Text>
        </TouchableOpacity>

        <Text style={screenWidth >= 576 ? styles.deleteOneWarningModalText : styles.phoneDeleteOneWarningModalText}>
          Are you sure you want to delete this transaction?{"\n"}This action cannot be undone.
        </Text>

        <TouchableOpacity
          style={styles.deleteOneConfirmButton}
          onPress={deleteARecord}
          activeOpacity={0.7}
        >
          <Text style={screenWidth >= 576 ? styles.deleteOneConfirmButtonText : styles.phoneDeleteOneConfirmButtonText}>
            CONFIRM
          </Text>
        </TouchableOpacity>
      </Modal>

      {/* Delete all shown transactions warning modal */}
      <Modal 
        isVisible={deleteShownWarningIsVisible} 
        style={styles.deleteOneWarningModal}
        onBackdropPress={() => setDeleteShownWarningIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.deleteOneWarningModalCloseButton}
          onPress={() => setDeleteShownWarningIsVisible(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteOneWarningModalCloseButtonX}>X</Text>
        </TouchableOpacity>

        <Text style={screenWidth >= 576 ? styles.deleteOneWarningModalText : styles.phoneDeleteOneWarningModalText}>
          Are you sure you want to delete all currently shown transaction?{"\n"}This action cannot be undone.
        </Text>

        <TouchableOpacity
          style={styles.deleteOneConfirmButton}
          onPress={deleteShownTransactions}
          activeOpacity={0.7}
        >
          <Text style={screenWidth >= 576 ? styles.deleteOneConfirmButtonText : styles.phoneDeleteOneConfirmButtonText}>
            CONFIRM
          </Text>
        </TouchableOpacity>
      </Modal>

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
    paddingHorizontal: 20, // Match header padding
    paddingTop: 0, // Remove top padding to stick to header
    marginTop: 20,
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
    fontSize:13
  },

  recordTableText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 20
  },

  phoneRecordTableText: {
    textAlign: 'center',
    fontWeight: '300',
    fontSize: 13
  },

  recordTableDataCells: {
    backgroundColor: '#E1BEE7',
    borderColor: "rgb(0, 0, 0)",
    borderWidth: 2,
    marginTop: -1,
    zIndex: 0
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
    fontSize: 22,
    textAlign: 'center'
  },

  PhonefiltersTitleText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center'
  },

  filtersSubtitleText: {
    fontWeight: 'bold',
    fontSize: 16
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
    fontSize: 17
  },

  textinputbox: {
    fontSize : 20
  },

  Phonetextinputbox: {
    fontSize : 15
  },

  invisibleRowEditButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0, // Completely invisible
    zIndex: 1, // Ensure it's above the row
    backgroundColor: 'transparent'
  },

  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    zIndex: 1,
    // make sure the container itself can shrink too, if nested in a flex row
    flexShrink: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    // allow the text node to shrink and wrap
    flexShrink: 1,
    flexWrap: 'wrap',
    // limit how wide it can grow
    maxWidth: '90%',
    // give some breathing room
    paddingHorizontal: 16,
  },

  editFormContainer: {
    backgroundColor: 'white',
    padding: 30,
    display : 'flex'
  },

  editFormTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 20
  },

  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  editFormDeleteButton: {
    backgroundColor: 'red',
    padding: 10,
    flex: 1, // Takes available space
    marginRight: '30%', // Space between buttons
  },

  modalCloseButton: {
    backgroundColor: 'grey',
    padding: 10,
    width: 50, // Fixed width for close button
    alignItems: 'center',
  },

  deleteButtonText: {
    fontWeight: 'bold', 
    fontSize: 20, 
    color: 'white',
    textAlign: 'center',
  },

  phoneDeleteButtonText: {
    fontWeight: 'bold', 
    fontSize: 14, 
    color: 'white',
    textAlign: 'center',
  },

  closeButtonText: {
    fontWeight: 'bold', 
    fontSize: 20, 
    color: 'white',
  },

  editFormFieldsText: {
    fontSize: 20
  },

  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },

  modalFooter: {
    marginTop: 20
  },

  editFormTextInputBox: {
    fontSize: 20,
    marginBottom: 20
  },

  phoneEditFormTextInputBox: {
    fontSize: 15,
    marginBottom: 20
  },

  editFormInvalidMsg: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold'
  },

  phoneEditFormInvalidMsg: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold'
  },

  deleteOneWarningModal: {
    alignSelf: 'center',
    width: '70%',
    backgroundColor: 'white',
    margin: 200, // Reduced from your original to prevent overflow
    borderRadius: 10, // Added for better aesthetics
    position: 'relative', // Required for absolute positioning of children
    paddingBottom: 40, // Added space for button
  },

  deleteOneWarningModalText: {
    padding: 50,
    textAlign: 'center',    
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 40, // Reduced negative margin
  },

  phoneDeleteOneWarningModalText: {
    padding: 50,
    textAlign: 'center',    
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 40, // Reduced negative margin
  },

  deleteOneConfirmButton: {
    alignSelf: 'center',
    backgroundColor: 'red',
    width: '80%',
    padding: 20,
    marginBottom: 20, // Reduced negative margin
    borderRadius: 5, // Added for better aesthetics
  },

  deleteOneConfirmButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold'
  },

  phoneDeleteOneConfirmButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },

  deleteOneWarningModalCloseButton: {
    position: 'absolute', // Changed from alignSelf
    top: 10,
    right: 10,
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 20, // Makes it circular
    zIndex: 1, // Ensures it stays on top
  },

  deleteOneWarningModalCloseButtonX: {
    fontSize: 20, // Reduced from 40 for better proportions
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    width: 20, // Ensures consistent click area
    height: 20,
  }

});
