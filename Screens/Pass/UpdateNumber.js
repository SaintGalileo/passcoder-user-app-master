import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { validate_phone_number } from '../../utils/Validations';

export default function UpdateNumber({ route }) {
    const { Number } = route.params

    //nav props
    const nav = useNavigation();

    //some state
    const [userNumber, setUserNumber] = useState(`0${Number.slice(4)}`);

    //loading state
    const [loading, setLoading] = useState(false)


    async function UpdateUserNumber() {
        if (!userNumber) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Enter your Phone Number"
            })
        } else if (!validate_phone_number(userNumber)) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid Phone Number"
            })
        } else {
            setLoading(true)
            Keyboard.dismiss();
    
            const userToken = await AsyncStorage.getItem('userToken');
            
            fetch(`${BaseUrl}/user/profile/phone`, {
                method: "PUT",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
    
                },
                body: JSON.stringify({
                    phone_number: `+234${userNumber.slice(1)}`
                })
            }).then(async (res) => {
                setLoading(false)
                const response = await res.json();
                if (response.success) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Updated successfully!"
                    })
                    nav.goBack();
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: res.status !== 422 ? response.message : response.data[0].msg
                    })
                }
            }).catch((err) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "an error occured!"
                })
            })
        }
    }


    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, margin: 15 }}>
                <Feather name="arrow-left" size={24} color={"#000"} onPress={() => nav.goBack()} />
                <Text style={{ fontFamily: "lexendBold", color: "#000", fontSize: 20, marginLeft: 10 }}>Update Phone Number</Text>
            </View>

            <View style={{ margin: 15, marginTop: 20 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.topInfo}>Phone Number</Text>
                    {/* <Text style={{ fontFamily: 'lexendLight', marginBottom: 15 }}>With country code (e.g. +234)</Text> */}
                    <TextInput
                        value={userNumber}
                        maxLength={11}
                        keyboardType='phone-pad'
                        onChangeText={(txt) => setUserNumber(txt)}
                        style={styles.inputStyle}
                        placeholder={Number}
                    />
                </View>
            </View>

            <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginBottom: 20 }}>
                <TouchableOpacity disabled={loading} style={styles.btnStyle} onPress={UpdateUserNumber}>
                    {loading ? (
                        <ActivityIndicator color="#fff" size={'small'} />
                    ) : (
                        <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Update</Text>
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
    topInfo: {
        fontFamily: "lexendBold",
        fontSize: 15,
        marginBottom: 15
    },
    inputStyle: {
        height: 50,
        borderRadius: 8,
        backgroundColor: "#eee",
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        fontSize: 15
    },
    btnStyle: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        borderRadius: 8
    }
})