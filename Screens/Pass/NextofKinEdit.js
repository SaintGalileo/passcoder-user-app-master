import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { return_trimmed_data, validate_email, validate_phone_number } from '../../utils/Validations';

export default function NextofKinEdit() {
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

    async function GetNext() {
        const userToken = await AsyncStorage.getItem('userToken');
        fetch(`${BaseUrl}/user/nok`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            if (response.data.next_of_kin_data) {
                setUserName(response.data.next_of_kin_data.name)
                setUserEmail(response.data.next_of_kin_data.email)
                setUserNumber(`0${response.data.next_of_kin_data.phone_number.slice(4)}`);
                setUserPid(response.data.next_of_kin_pid === null ? '' : response.data.next_of_kin_pid);
                setLoading(false)
            } else {
                setUserName(response.data.name)
                setUserEmail(response.data.email)
                setUserNumber(`0${response.data.phone_number.slice(4)}`);
                setUserPid(response.data.next_of_kin_pid === null ? '' : response.data.next_of_kin_pid);
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        GetNext();
    }, [])

    async function UpdateNextOfKin() {
        Keyboard.dismiss();
        if (method === "Name") {
            if (userName.length < 3) {

                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Name too short!"
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
                setLoading(true)
                const userToken = await AsyncStorage.getItem('userToken')
                fetch(`${BaseUrl}/user/nok`, {
                    method: "PUT",
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

                    setLoading(false);
                    if (res.status === 204 || res.status === 200) {
                        Toast.show({
                            type: "success",
                            text1: "Success",
                            text2: "Updated successfully!"
                        })
                        nav.goBack()
                    } else {
                        const error_res = await res.json();
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
                        });
                    }
                }).catch((err) => {
                    setLoading(false);
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "An error occured"
                    });
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
                setLoading(true)
                const userToken = await AsyncStorage.getItem('userToken')
                fetch(`${BaseUrl}/user/nok/via/pid`, {
                    method: "PUT",
                    headers: {
                        'passcoder-access-token': userToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        next_of_kin_pid: userPID.toLocaleUpperCase()
                    })
                }).then(async (res) => {
                    setLoading(false);
                    if (res.status === 204 || res.status === 200) {
                        Toast.show({
                            type: "success",
                            text1: "Success",
                            text2: "Updated successfully!"
                        })
                        nav.goBack()
                    } else {
                        const error_res = await res.json();
                        Toast.show({
							type: "error",
							text1: "Error",
							text2: res.status !== 422 ? "Error occured while updating" : error_res.data[0].msg
						});
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
                    <Text style={{ fontFamily: "lexendLight" }}>Update Next of Kin Details</Text>
                </View>
                <View />
            </View>
            <ScrollView>

                <View style={{ marginBottom: 10, marginTop: 20 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        {methodData.map((data, index) => (
                            <TouchableOpacity onPress={() => { setMethod(data.title); if (data.title === "Name") GetNext() }} key={index} style={[styles.touchStyle, { backgroundColor: method === data.title ? "#eee" : null }]}>
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
                                value={userName}
                                onChangeText={(txt) => setUserName(txt)}
                                keyboardType='default'
                                style={styles.textInput}
                                placeholder='Enter Name'
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>Email</Text>
                            <TextInput
                                value={userEmail}
                                onChangeText={(txt) => setUserEmail(txt)}
                                keyboardType='default'
                                style={styles.textInput}
                                placeholder='Enter Email Address'
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'lexendBold' }}>Phone Number</Text>
                            <Text style={{ fontFamily: 'lexendLight', marginTop: 5, marginBottom: 5 }}>With country code (e.g. +234)</Text>
                            <TextInput
                                value={userNumber}
                                onChangeText={(txt) => setUserNumber(txt)}
                                keyboardType='phone-pad'
                                style={styles.textInput}
                                placeholder='e.g +2348011111111'
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
                <TouchableOpacity disabled={loading} onPress={UpdateNextOfKin} style={{ backgroundColor: AppColor.Blue, height: 50, width: 300, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                    {loading ? (
                        <ActivityIndicator color={'#fff'} size={'small'} />
                    ) : (
                        <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Save Changes</Text>
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