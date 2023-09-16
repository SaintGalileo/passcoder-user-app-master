import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { BaseUrl } from '../../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColor } from '../../../utils/Color';
import Toast from 'react-native-toast-message';

export default function ViewContact() {

    const nav = useNavigation();

    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    async function DeleteContact(id) {
        Alert.alert('Delete', 'Are you sure you want to delete this contact?', [
            {
                text: "Cancel"
            }, {
                text: "Yes",
                onPress: async () => {
                    const userToken = await AsyncStorage.getItem('userToken')
                    fetch(`${BaseUrl}/user/medical/emergency/contact`, {
                        method: "DELETE",
                        headers: {
                            'passcoder-access-token': userToken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            unique_id: id
                        })
                    }).then(async (res) => {

                        const response = await res.json();
                        if (response.success === true) {
                            GetContacts()
                            Toast.show({
                                type: "success",
                                text1: "Success",
                                text2: "Contact Deleted!"
                            })
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "An error occured!"
                            })
                        }
                    }).catch(() => {
                        GetContacts()
                    })
                }
            }
        ])
    }

    async function GetContacts() {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/medical/emergency/contacts`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            setLoading(false);
            const response = await res.json();
            setContacts(response.data);
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    useEffect(() => {
        GetContacts()
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetContacts().then(() => {
            setRefreshing(false)
        })
    }, []);

    //render item
    const renderItem = ({ item }) => (
        <TouchableOpacity
            onLongPress={() => DeleteContact(item?.unique_id)}
            style={{ height: 'auto', backgroundColor: "#fff", padding: 15, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View>
            <Text style={{ fontFamily: "lexendMedium", fontSize: 18 }}>{item?.name}- {item?.relationship.charAt(0).toUpperCase() + item?.relationship.slice(1)}</Text>
                <Text style={{ fontFamily: "lexendBold", fontSize: 15 }}>{item?.phone_number}</Text>
            </View>
            <View>
                <MaterialCommunityIcons onPress={() => DeleteContact(item?.unique_id)} name="trash-can-outline" size={24} color="grey" />
            </View>
        </TouchableOpacity>
    )
    return (
        <View style={{ flex: 1 }}>

            {/*Top*/}
            <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Emergency Contacts</Text>
                    <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>View your Emergency Contacts</Text>
                </View>
                <View>

                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
                    <ActivityIndicator color={AppColor.Blue} size={'large'} />
                </View>
            ) : (
                contacts.length === 0 ?
                    <TouchableOpacity onPress={() => nav.navigate('AddContact')} style={{ flex: 1, justifyContent: "center", alignItems: 'center', marginTop: 50 }}>
                        <Feather name="plus-circle" size={30} color="#3399ff" />
                        <Text style={{ fontFamily: "lexendMedium" }}>Add Contact</Text>
                    </TouchableOpacity> : 
                    <>
                        <View style={{ margin: 15 }}>
                            <FlatList
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                                showsVerticalScrollIndicator={false}
                                data={contacts}
                                keyExtractor={item => `${item.unique_id}`}
                                renderItem={renderItem}
                            />

                        </View>
                        <TouchableOpacity onPress={() => nav.navigate('AddContact')} style={{ justifyContent: "center", alignItems: 'center', marginTop: 50 }}>
                            <Feather name="plus-circle" size={30} color="#3399ff" />
                            <Text style={{ fontFamily: "lexendMedium" }}>Add more contacts</Text>
                        </TouchableOpacity>
                    </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({})