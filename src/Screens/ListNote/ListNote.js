import React, { useContext } from 'react';
import { StyleSheet, Text, View, ToastAndroid, TouchableOpacity, SafeAreaView, FlatList, StatusBar }  from 'react-native';
import { NavigationContainer, useTheme, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Context } from '../../Store';
import EncryptedStorage from 'react-native-encrypted-storage';

export default ListNote = ({ navigation }) => {
  const { state, update } = useContext(Context);
  const { colors } = useTheme();
  console.log('[LISTNOTE]')

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity onPress={(e) => navigation.navigate('Add', { id: item._id, title: item.title, content: item.content })} style={[styles.item, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title === "" ? "Untitled" : item.title}</Text>
        <Text style={[styles.content, { color: colors.text }]}>{item.content === "" ? "(Empty)" : (item.content.length > 65 ? item.content.substring(0, 65) + '...' : item.content.substring(0, 65))}</Text>
      </TouchableOpacity>
    </View>
  );

  const syncNote = async () => {
    if(state.notesSyncing) return;
    try {
      ToastAndroid.showWithGravity(
        "Syncing notes...",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      update(prevState => ({ ...prevState, notesSyncing: true }));
      console.log('Note syncing...')
      const notesRecord = await fetch(`${state.serverAddress}/note/`, {
        headers: {
          "auth-token": state.accessToken
        }
      }).then(response => response.json());
  
      if(notesRecord && notesRecord.success) {
        console.log('Note synced')
        await EncryptedStorage.setItem('notes', JSON.stringify(notesRecord.data));
        update(prevState => ({ ...prevState, notesSyncing: false, notes: notesRecord.data.reverse() }));
        return notesRecord;
      }
      ToastAndroid.showWithGravity(
        "Syncing notes done",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } catch(error) {
      console.error(error)
      update(prevState => ({ ...prevState, notesSyncing: false }));
      ToastAndroid.showWithGravity(
        "Syncing notes failed!",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      return false;
    }
  }

  React.useEffect(() => {
    (async() => {
      if(state.notesSynced) return;
      const result = await syncNote();
      update(prevState => ({ ...prevState, notesSynced: true }));
    })()
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        refreshing={state.notesSyncing}
        onRefresh={() => syncNote()}
        data={state.notes}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    marginTop: -6
  },
  row: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  item: {
    backgroundColor: '#fff',
    paddingVertical:15,
    paddingHorizontal:20,
    borderRadius: 8
  },
  title: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 3
  },
  content: {
    color: 'gray',
    fontStyle: 'italic',
    fontSize: 12
  }
});
