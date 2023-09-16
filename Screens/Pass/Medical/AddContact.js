import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../../utils/Color'
import { BaseUrl } from '../../../utils/Url';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AddContact() {

    const nav = useNavigation();
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [number, setNumber] = useState('');

    async function AddContact() {
        if (!name) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Name is required"
            })
        } else if (!relationship) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Relationship is required"
            })
        } else if (!number) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Phone Number is required"
            })
        } else {
            const userToken = await AsyncStorage.getItem('userToken');
            setLoading(true)
            fetch(`${BaseUrl}/user/medical/emergency/contact/add`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
    
                },
                body: JSON.stringify({
                    name: name,
                    relationship: relationship,
                    phone_number: number
                })
            }).then(async (res) => {
                const response = await res.json();
    
                if (response.success === false) {
                    setLoading(false)
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    })
                    nav.goBack();
                } else {
                    setLoading(false)
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Emergency Contact Uploaded!"
                    });
                    nav.goBack();
                }
            }).catch((err) => {
                setLoading(false)
            })
        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/*Top*/}
            <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Emergency Contacts</Text>
                    <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Choose your Emergency Contacts</Text>
                </View>
                <View>

                </View>
            </View>


            <View style={{ margin: 15 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topText}>Name of Contact</Text>
                    <TextInput
                        onChangeText={(txt) => setName(txt)}
                        style={styles.textInput}
                        placeholder='Enter the name of your contact' />
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topText}>Relationship</Text>
                    <TextInput
                        onChangeText={(txt) => setRelationship(txt)}
                        style={styles.textInput}
                        placeholder='What’s your relationship?' />
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topText}>Enter Phone Number</Text>
                    <TextInput
                        maxLength={11}
                        onChangeText={(txt) => setNumber(txt)}
                        keyboardType='number-pad'
                        style={styles.textInput}
                        placeholder='Enter Phone Number' />
                </View>
            </View>


            <View style={{ backgroundColor: "#FFFFFF", height: 90, bottom: 0, position: "absolute", width: Dimensions.get('screen').width }}>
                <View style={{width: 300, flex: 1, alignSelf: "center", top: 20 }}>
                    <TouchableOpacity disabled={loading} onPress={AddContact} style={{ backgroundColor: AppColor.Blue, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: "center" }}>
                        {loading ? (
                            <ActivityIndicator color={'#fff'} size={'small'} />
                        ) : (
                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topText: {
        fontFamily: "lexendBold",
    },
    textInput: {
        backgroundColor: '#eee',
        height: 50,
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        marginTop: 10,
        borderRadius: 8
    }
})