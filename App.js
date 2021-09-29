/*
  !!! https://docs.amplify.aws/start (React Native & Expo)

  When you initialize a new Amplify project, a few things happen:

  It creates a top level directory called amplify that stores your backend definition. During the tutorial you'll add capabilities such as a GraphQL API 
  and authentication. As you add features, the amplify folder will grow with infrastructure-as-code templates that define your backend stack. 
  Infrastructure-as-code is a best practice way to create a replicable backend stack.

  It creates a file called aws-exports.js in the src directory that holds all the configuration for the services you create with Amplify. 
  This is how the Amplify client is able to get the necessary information about your backend services.

  It modifies the .gitignore file, adding some generated files to the ignore list.

  A cloud project is created for you in the AWS Amplify Console that can be accessed by running amplify console. The Console provides a list of backend 
  environments, deep links to provisioned resources per Amplify category, status of recent deployments, and instructions on how to promote, 
  clone, pull, and delete backend resources.
*/

// import { withAuthenticator } from 'aws-amplify-react-native';
import { TextInput, Button, StyleSheet, Text, View } from 'react-native';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native'
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);

import { API, graphqlOperation } from '@aws-amplify/api';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ListBooks, AddBook } from './src/components/graphql.js';
import ResourceGrid from './src/components/ResourceGrid.js';
import { Tab } from 'react-native-elements';
import AddBooks from './src/components/AddBook.js';


function App() {
  const [books, setBooks] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  //TODO export from other file
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      paddingHorizontal: 10,
      paddingTop: 50
    },
    input: {
      height: 50,
      borderBottomWidth: 2,
      borderBottomColor: 'blue',
      marginVertical: 10
    },
    book: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingVertical: 10
    },
    title: { fontSize: 16 },
    author: { color: 'rgba(0, 0, 0, .5)' }
  });

  useEffect(() => {
    const getResult = async () => {
      const books = await API.graphql(graphqlOperation(ListBooks));
      console.log('books: ', books)
      setBooks(books.data.listBooks.items);
    };

    try {
      getResult();
    } catch(err) {
      console.log(err)
    }
  }, [])

  const renderSwitch = (param) => {
    switch(param) {
      case 0:
        return <ResourceGrid books={books}/>
      case 1:
        return <ResourceGrid books={[]}/>;
      case 3: 
        return <AddBooks />;
      default:
        return <ResourceGrid books={books}/>;
    }
  }

  return (
    <View style={styles.container}>
      <Tab value={tabIndex} onChange={val => setTabIndex(val)}>
        <Tab.Item title="home" />
        <Tab.Item title="depos" />
        <Tab.Item title="poi" />
        <Tab.Item title="addBook" />
      </Tab>
      {
        renderSwitch(tabIndex)
      }
    </View>
  );
}

export default withAuthenticator(App);