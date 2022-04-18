import * as React from 'react';
import { Context } from '../../Store';
import { Alert, TextInput, TouchableOpacity, Appearance, View, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import EncryptedStorage from 'react-native-encrypted-storage';

export default Add = ({ route, navigation }) => {
  let id, title, content;
  const { state, update } = React.useContext(Context);
  console.log('[ADD]')
  if(route.params != undefined) {
    id = route.params.id;
    title = route.params.title;
    content = route.params.content;
  } 
  const [newId, setNewId] = React.useState(id || '');
  const [newTitle, setNewTitle] = React.useState(title || '');
  const [newContent, setNewContent] = React.useState(content || '');
  const [saved, setSaved] = React.useState(true);
  const elTitleArea = React.useRef(null);
  const elContentArea = React.useRef(null);

  const handleSave = async(e) => {
    
    elTitleArea.current.blur();
    elContentArea.current.blur();

    if(newTitle === '' && newContent === '') return; 

    try {
      update(prevState => ({ ...prevState, isLoading: true}))
      let dataToSend = { title: newTitle || "", content: newContent || "" }

      if(route.params != undefined) {
        dataToSend = { id: newId || "", title: newTitle || "", content: newContent || "" }
      }

      const result = await fetch(`${state.serverAddress}/note/`, {
        'method': route.params === undefined ? 'POST' : 'PATCH',
        headers: {
          Accept: 'application/json',
					'Content-Type': 'application/json',
          "auth-token": state.accessToken
        },
        body: JSON.stringify(dataToSend)
      }).then((res) => res.json())

      if(!result.success) throw new Error(result.message);

      let newNotes = state.notes.reverse();

      if(route.params === undefined) {
        setNewId(result.data._id);
        id = result.data._id;
        title = result.data.title;
        content = result.data.content;
        newNotes.push(result.data);
        navigation.setParams({id: result.data._id, title: result.data.title, content: result.data.content})
      } else {
        newNotes = newNotes.map(obj => {
          if (obj._id === result.data._id) {
            return result.data;
          }
        
          return obj;
        });
      }

      await EncryptedStorage.setItem('notes', JSON.stringify(newNotes));
      update(prevState => ({ ...prevState, notes: newNotes.reverse(), isLoading: false }));
      setSaved(true);
      return;
    } catch(error) {
      console.error(error)
    }

    return;
  }

  const confirmDelete = () => {
    Alert.alert(
      "Caution",
      "Are you sure want to delete this note?",
      [
        {
          text: "Close",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => handleDelete()
        }
      ]
    );
  }

  const handleDelete = async () => {
    update(prevState => ({ ...prevState, isLoading: true}))
    try{
      const notesRecord = await fetch(`${state.serverAddress}/note/${id}`, {
        'method': 'DELETE',
        headers: {
          "auth-token": state.accessToken
        }
      }).then(response => response.json());

      if(!notesRecord.success) throw new Error(notesRecord.message)
    } catch(error) {
      console.log(error);
    }

    const newNotes = state.notes.reverse();
    newNotes.splice(newNotes.findIndex(note => note._id === id) , 1);

    await EncryptedStorage.setItem('notes', JSON.stringify(newNotes));

    update(prevState => ({ ...prevState, notes: newNotes.reverse(), isLoading: false }))
    navigation.navigate('ListNote');
  }

  const handleTitle = async (e) => {
    setNewTitle(e);
    if(saved) setSaved(false)
  }

  const handleContent = async (e) => {
    setNewContent(e)
    if(saved) setSaved(false)
  }

  React.useEffect(() => {
    let newTitleSaved;
    if(route.params === undefined) {
      if(newTitle != '' || newContent != '') {
        setSaved(false)
      } else if(newTitle === '' && newContent === '') {
        setSaved(true)
      }
      if(newTitle === '') {
        newTitleSaved = "New Note";
      } else {
        newTitleSaved = newTitle;
      }
    } else {
      if(newTitle === '') {
        newTitleSaved = "";
      } else {
        newTitleSaved = newTitle;
      }
      if(newTitle === '' && newContent === '') {
        setSaved(true)
      }
    }

    navigation.setOptions({
      title: newTitleSaved,
      headerRight:() =>(
        <View style={{ flexDirection: 'row' }}>
          { !saved &&
            <View>
              <TouchableOpacity onPress={(e) => handleSave(e)} style={{ padding: 8 }}>
                <FontAwesomeIcon color={Appearance.getColorScheme() === "dark" ? '#fff' : '#000'} icon={ faCheck } size={20} />
              </TouchableOpacity>
            </View>
          }
          { route.params != undefined &&
            <View style={{ marginLeft: 10, marginRight: -8 }}>
              <TouchableOpacity onPress={(e) => confirmDelete(e)} style={{  padding: 8}}>
                <FontAwesomeIcon color={Appearance.getColorScheme() === "dark" ? '#fff' : '#000'} icon={ faTrash } size={20} />
              </TouchableOpacity>
            </View>
          }
        </View>
      )
    });
  }, [navigation, newId, newTitle, newContent, saved]);

  return (
    <ScrollView>
      <View>
        <TextInput
        ref={elTitleArea}
          style={{margin: 12, padding: 10, borderBottomWidth:1, borderBottomColor:'rgba(0,0,0,0.2)', fontWeight: 'bold'}}
          onChangeText={(value) => handleTitle(value)}
          value={newTitle}
          placeholder={'Title'}
        />
      </View>
      <View>
        <TextInput
          ref={elContentArea}
          autoFocus={route.params != undefined ? false : true}
          multiline={true}
          style={{height: 'auto',marginHorizontal: 12, marginBottom:12, padding: 10, textAlignVertical: 'top'}}
          onChangeText={(value) => handleContent(value)}
          value={newContent}
          placeholder="Type here..."
        />
      </View>
    </ScrollView>
  );
};
