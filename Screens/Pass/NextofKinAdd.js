import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { return_trimmed_data, validate_email, validate_phone_number } from '../../utils/Validations';

export default function NextofKinAdd() {
    const nav = useNavigation();

    //method data
    const methodData = [
        {
            title: 'Name',
            desc: "name"
        },
        {
            title: "PID",
            desc: "Pid"
        }
    ]

    const [method, setMethod] = useState('Name');
    const [loading, setLoading] = useState(false)

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userNumber, setUserNumber] = useState('');
    const [userPID, setUserPid] = useState('')

    async function addNextOfKin() {
        Keyboard.dismiss();
        if (method === "Name") {
            if (!userName) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Enter Name"
                })
            } else if (userName.length < 3 || userName.length > 50) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Name | Invalid length"
                })
            } else if (!userEmail) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Enter Email address"
                })
            } else if (!validate_email(userEmail)) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Invalid email address"
                })
            } else if (!userNumber) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Enter Phone Number"
                })
            } else if (!validate_phone_number(userNumber)) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Invalid Phone Number"
                })
            } else {
                setLoading(true);

                const userToken = await AsyncStorage.getItem('userToken')
                fetch(`${BaseUrl}/user/nok/add`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        name: return_trimmed_data(userName),
                        email: return_trimmed_data(userEmail),
                        phone_number: `+234${userNumber.slice(1)}`
                    })
                }).then(async (res) => {
                    const response = await res.json();
                    setLoading(false);

                    if (response.success === false) {
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        })
                    } else {
                        Toast.show({
                            type: "success",
                            text1: "Success",
                            text2: response.message
                        })
                        nav.goBack()
                    }
                }).catch((err) => {
                    setLoading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured"
                    })
                })
            }
        } else {
            if (userPID.length < 6) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "PID must be 6 digits"
                })
            } else {
                setLoading(true);

                const userToken = await AsyncStorage.getItem('userToken')
                fetch(`${BaseUrl}/user/nok/via/pid`, {
                    method: "POST",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        next_of_kin_pid: userPID.toLocaleUpperCase()
                    })
                }).then(async (res) => {
                    setLoading(false)
                    const response = await res.json();
                    
                    if (response.success === false) {
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: response.message
                        })
                    } else {
                        Toast.show({
                            type: "success",
                            text1: "Success",
                            text2: response.message
                        })
                        nav.goBack()
                    }
                }).catch((err) => {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured"
                    })
                })
            }
        }
    }

    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Next Of Kin</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>Add Next of Kin Details</Text>
                </View>
                <View />
            </View>
            <ScrollView>

                <View style={{ marginBottom: 10, marginTop: 20 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        {methodData.map((data, index) => (
                            <TouchableOpacity onPress={() => setMethod(data.title)} key={index} style={[styles.touchStyle, { backgroundColor: method === data.title ? "#eee" : null }]}>
                                <Text style={{ fontFamily: "lexendBold", color: method === data.title ? AppColor.Blue : AppColor.BoldGrey }}>{data.title}</Text>
                            </TouchableOpacity>
                        ))}

                    </View>
                </View>

                {method === "Name" ? (
                    <View style={{ margin: 15 }}>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>Name</Text>
                            <TextInput
                                onChangeText={(txt) => setUserName(txt)}
                                keyboardType='default'
                                style={styles.textInput}
                                placeholder='Enter Name'
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>Email</Text>
                            <TextInput
                                onChangeText={(txt) => setUserEmail(txt)}
                                keyboardType='email-address'
                                style={styles.textInput}
                                placeholder='Enter Email Address'
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold', marginBottom: 5 }}>Phone Number</Text>
                            {/* <Text style={{ fontFamily: 'lexendLight', marginTop: 5, marginBottom: 5 }}>With country code (e.g. +234)</Text> */}
                            <TextInput
                                onChangeText={(txt) => setUserNumber(txt)}
                                maxLength={11}
                                keyboardType='phone-pad'
                                style={styles.textInput}
                                placeholder='e.g 08011111111'
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{ margin: 15 }}>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>Enter PID</Text>
                            <TextInput
                                onChangeText={(txt) => setUserPid(txt)}
                                autoCapitalize='characters' 
                                maxLength={6}
                                keyboardType='default'
                                style={styles.textInput}
                                placeholder='Enter Passcoder ID'
                            />
                        </View>
                    </View>
                )}
                <View style={{ height: 300 }} />
            </ScrollView>

            <View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", flex: 1 }}>
                <TouchableOpacity disabled={loading} onPress={addNextOfKin} style={{ backgroundColor: AppColor.Blue, height: 50, width: 300, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                    {loading ? (
                        <ActivityIndicator color={'#fff'} size={'small'} />
                    ) : (
                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Submit</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    textInput: {
        height: 50,
        backgroundColor: "#eee",
        borderRadius: 8,
        paddingLeft: 20, 
        paddingRight: 20,
        fontFamily: "lexendMedium",
        marginTop: 10
    },
    btn: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 8,
        width: 300
    },
    touchStyle: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        width: 150,
        borderRadius: 8
    },
})